import { PaymentCardService } from './../../payment_card/payment_card.service';
import { OrderNotificationService } from './order_notification.service';
import { OrderService } from './order.service';
import { PaymentSessionService } from '../../payment_session/payment_session.service';
import { TransactionService } from '../../transaction/services/transaction.service';
import { CustomerService } from '../../customer/customer.service';
import { StoreService } from 'src/modules/store/services/store.service';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order_status';
import { PaymentMethod } from 'src/common/enums/payment_method';
import { CONFIRMATION_PENDING_MINUTES, MIN_POINTS_TO_USE } from 'src/common/constants';
import { Customer } from '../../customer/entities/customer.entity';
import { Sequelize } from 'sequelize';
import { TransactionType } from 'src/common/enums/transaction_type';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { StoreStatus } from 'src/common/enums/store_status';
import { OrderPointsService } from './order_points.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { PaymentSession } from 'src/modules/payment_session/entities/payment_session.entity';
import { PayOrderDTO } from '../dto/requests/pay-order-dto';
import { formatCardForApi } from 'src/common/utils/formatCardForApi';
import { PaymentCard } from 'src/modules/payment_card/entities/payment_card.entity';
import { StoreUtilsService } from 'src/modules/store/services/storeUtils.service';
import { ApplePayPaymentDTO } from 'src/modules/payment_session/dto/apple-payment.dto';
import { PaymentGatewayFactory } from 'src/modules/payment_session/payment_gateway.factory';

@Injectable()
export class OrderPaymentService {
    constructor(
        @Inject(repositories.order_repository) private orderRepo: typeof Order,
        private readonly storeService: StoreService,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly customerService: CustomerService,

        @Inject(forwardRef(() => TransactionService))
        private readonly transactionService: TransactionService,
        
        @Inject(forwardRef(() => PaymentSessionService))
        private readonly paymentSessionService: PaymentSessionService,
        private orderPointsService: OrderPointsService,
        private orderService: OrderService,
        private readonly i18n: I18nService,
        private readonly orderNotificationService:OrderNotificationService,
        private readonly paymentCardService:PaymentCardService,
        private readonly  storeUtilsService : StoreUtilsService
    ) {}

    async payOrder(orderId: number, customer: Customer, dto:PayOrderDTO,lang: Language) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.getValidOrder(orderId, customer, transaction, lang);
            const pointsValue = order.pointsAmountUsed;
            let amountLeftToPay = order.finalPriceToPay - pointsValue;

            if (amountLeftToPay <= 0) {
                return await this.handlePointsOnlyPayment(order, customer, transaction, lang);
            }
            switch (order.paymentMethod) {
                case PaymentMethod.WALLET:
                    return await this.handleWalletPayment(order, customer, amountLeftToPay, transaction, lang);
                case PaymentMethod.GATEWAY:
                    if (dto.applePayPayment) {
                    return await this.handleApplePayPayment(order, customer, dto.applePayPayment, amountLeftToPay, transaction,lang);
                    } else {
                        return await this.handleGatewayPayment(order, customer, dto, amountLeftToPay, transaction);
                    }
                default:
                    throw new BadRequestException(this.i18n.translate('translation.orders.invalid_payment_method', { lang }));
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private async getValidOrder(orderId: number, customer: Customer, transaction: any, lang: Language) {
        const order = await this.orderRepo.findOne({ where: { id: orderId, customerId:customer.id }, transaction });
        if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

        const store = await this.storeService.getStoreById(order.storeId);
        if (store.status !== StoreStatus.APPROVED) {
            throw new BadRequestException(this.i18n.translate('translation.orders.store_unavailable', { lang }));
        }

        if (!order.scheduledAt && !(await this.storeUtilsService.isStoreOpenAt(store.id, new Date(),store.timezone))) {
            throw new BadRequestException(this.i18n.translate('translation.orders.store_closed_now', { lang }));
        }

        if (order.scheduledAt && new Date(order.scheduledAt) <= new Date()) {
            throw new BadRequestException(this.i18n.translate('translation.orders.scheduled_in_past', { lang }));
        }

        if (order.isPaid) throw new BadRequestException(this.i18n.translate('translation.orders.already_paid', { lang }));
        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_payment', { lang }));
        }

        if (order.pointsRedeemed > 0) {
            if (customer.points < MIN_POINTS_TO_USE) {
                throw new BadRequestException(this.i18n.translate('translation.orders.min_points_required', { lang }));
            }
            if (order.pointsRedeemed > customer.points) {
                throw new BadRequestException(this.i18n.translate('translation.orders.points_exceed_balance', { lang }));
            }
        }

        return order;
    }

    private async handlePointsOnlyPayment(order: Order, customer: Customer, transaction: any, lang: Language) {
        order.orderNumber = await this.orderService.generateOrderNumber(order.storeId, transaction);
        await order.save({ transaction });

        await this.updateOrderPaymentInfo(order, transaction);
        await this.orderPointsService.deductPointsForOrder(customer.id, order.pointsRedeemed, order.id, transaction);

        await transaction.commit();

        this.orderNotificationService.notifyStoreSocket({ orderId: order.id, status: order.status, storeId: order.storeId });
        await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.orderNumber, order.status, order.storeId, lang);

        return { success: true, message: this.i18n.translate('translation.orders.paid_with_points', { lang }) };
    }

    private async handleWalletPayment(order: Order, customer: Customer, amountLeft: number, transaction: any, lang: Language) {
        if (customer.walletBalance < amountLeft) {
            throw new BadRequestException(this.i18n.translate('translation.orders.wallet_insufficient', { lang }));
        }

        order.orderNumber = await this.orderService.generateOrderNumber(order.storeId, transaction);
        await order.save({ transaction });

        await this.customerService.detuctFromWallet(customer.id, amountLeft, transaction);
        await this.updateOrderPaymentInfo(order, transaction);
        await this.orderPointsService.deductPointsForOrder(customer.id, order.pointsRedeemed, order.id, transaction);

        await this.transactionService.createTransaction({
            customerId: customer.id,
            amount: amountLeft,
            direction: 'OUT',
            type: TransactionType.PURCHASE_WALLET,
            orderId: order.id,
        }, transaction);

        await transaction.commit();
        this.orderNotificationService.notifyStoreSocket({ orderId: order.id, status: order.status, storeId: order.storeId });
        await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.orderNumber, order.status, order.storeId, lang);

        return { success: true, message: this.i18n.translate('translation.orders.paid_with_points_and_wallet', { lang }) };
    }

    private async handleGatewayPayment(order: Order, customer: Customer, dto: PayOrderDTO, amountLeft: number, transaction: any) {
        const { cvc, paymentCardId, newCard } = dto;

        if (!cvc) throw new BadRequestException('You should send cvc of your card');

        let card: PaymentCard;

        if (paymentCardId) {
            card = await this.paymentCardService.getOne(paymentCardId, customer.id);
        } else if (newCard) {
            if (newCard.isSave) {
                card = await this.paymentCardService.create({ ...newCard, isDefault: false }, customer.id);
            } else {
                card = { ...newCard, customerId: customer.id } as any;
            }
        } else {
            throw new BadRequestException('Either paymentCardId or newCard must be provided');
        }

        const apiCard = formatCardForApi(card);
        order.cardNumber = apiCard.cardNumber
        await order.save()

        await transaction.rollback();

        const { redirectUrl, redirectMethod, redirectParams, paymentId } = await this.paymentSessionService.startPayment({
            customer,
            amount: amountLeft,
            provider: order.paymentGateway,
            purpose: GatewaySource.order,
            card: { ...apiCard, cvc },
            sourceId: order.id,
        });

        return { redirect: { redirectUrl, redirectMethod, redirectParams, paymentId } };
    }

    private async handleApplePayPayment(order: Order, customer: Customer, applePayData: ApplePayPaymentDTO, amountLeft: number, transaction: any,lang:Language) {
        const gateway = PaymentGatewayFactory.getProvider(order.paymentGateway);
        const paymentSuccess = await gateway.createApplePayPayment(amountLeft, 'SAR', 'https://lahent.sa/api', customer, applePayData);

        if (!paymentSuccess) {
            throw new BadRequestException('Apple Pay payment failed');
        }

        await this.updateOrderPaymentInfo(order, transaction);
        await this.transactionService.createTransaction({
                customerId: order.customerId,
                amount: amountLeft ?? 0,
                direction: 'OUT',
                type: TransactionType.PURCHASE_GATEWAY,
                orderId: order.id,
            }, transaction);

        await transaction.commit();

        this.orderNotificationService.notifyStoreSocket({ orderId: order.id, status: order.status, storeId: order.storeId });
        await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.orderNumber, order.status, order.storeId, lang);
        return { success: true, message: 'Paid with Apple Pay' };
    }

    async confirmOrderPayment(session: PaymentSession, lang: Language = Language.ar) 
    {
        const transaction = await this.sequelize.transaction();
        try {
            // 1️⃣ جلب الطلب والتحقق من وجوده
            const order = await this.orderRepo.findOne({ where: { id: session.orderId }, transaction });
            if (!order) {
                await transaction.rollback();
                throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));
            }

            const customer = await this.customerService.findById(order.customerId);

            // 2️⃣ التحقق من صلاحية الطلب
            if (order.status === OrderStatus.EXPIRED_PAYMENT) {
                await this.refundWalletIfNeeded(order.customerId, order.walletAmountUsed, order.gatewayAmountUsed, order.id, transaction);
                throw new BadRequestException(this.i18n.translate('translation.orders.expired_order_refund', { lang }));
            }

            // 3️⃣ التحقق من النقاط المستخدمة
            if (order.pointsRedeemed > 0) {
                if (customer.points < order.pointsRedeemed) {
                    await this.refundWalletIfNeeded(order.customerId, order.walletAmountUsed, order.gatewayAmountUsed, order.id, transaction);
                    throw new BadRequestException(this.i18n.translate('translation.orders.points_insufficient', { lang }));
                }
            }

            // 4️⃣ تحديث رقم الطلب وحفظه
            order.orderNumber = await this.orderService.generateOrderNumber(order.storeId, transaction);
            await this.updateOrderPaymentInfo(order,transaction)
            await order.save({ transaction });

            // 5️⃣ خصم النقاط المستخدمة (إن وجدت)
            if (order.pointsRedeemed > 0) {
                await this.orderPointsService.deductPointsForOrder(customer.id, order.pointsRedeemed, order.id, transaction);
            }

            // 6️⃣ إنشاء المعاملة للبوابة
            await this.transactionService.createTransaction({
                customerId: order.customerId,
                amount: session.amount ?? 0,
                direction: 'OUT',
                type: TransactionType.PURCHASE_GATEWAY,
                orderId: order.id,
            }, transaction);

            // 7️⃣ إشعارات المتجر
            this.orderNotificationService.notifyStoreSocket({orderId: order.id,status: order.status,storeId: order.storeId});
            await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.orderNumber, order.status, order.storeId, lang);

            // 8️⃣ تأكيد المعاملة
            await transaction.commit();

            return { success: true, message: this.i18n.translate('translation.orders.payment_confirmed', { lang }) };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private async updateOrderPaymentInfo(order: Order, transaction: any) {
        order.isPaid = true;
        order.status = OrderStatus.PENDING_CONFIRMATION;
        order.paidAt = new Date();
        order.confirmationTimeoutAt = new Date(order.paidAt.getTime() + CONFIRMATION_PENDING_MINUTES * 60 * 1000);
        await order.save({ transaction });
    }

    async processOrderRefund(order: Order, newStatus: OrderStatus, transaction: any) {
        await this.refundWalletIfNeeded(order.customerId, order.walletAmountUsed, order.gatewayAmountUsed, order.id, transaction);
        await this.orderPointsService.addPointsForRefund(order.customerId, order.pointsRedeemed, order.id, transaction);
        order.status = newStatus;
        order.canceledAt = new Date();
        await order.save({ transaction });
    }

    async refundWalletIfNeeded(customerId: number, walletAmountUsed: number, gatewayAmountUsed: number, orderId: number, transaction: any) 
    {
        const totalRefund = (walletAmountUsed || 0) + (gatewayAmountUsed || 0);
        if (totalRefund > 0) {
            await this.customerService.addToWallet(customerId, totalRefund, transaction);
            await this.transactionService.createTransaction({
                customerId,
                amount: totalRefund,
                direction: 'IN',
                type: TransactionType.REFUND_WALLET,
                orderId,
            }, transaction);
        }
    }
}