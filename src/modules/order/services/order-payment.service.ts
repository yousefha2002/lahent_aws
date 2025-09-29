import { PaymentCardService } from './../../payment_card/payment_card.service';
import { OrderNotificationService } from './order_notification.service';
import { OrderService } from './order.service';
import { UserPointHistoryService } from '../../user_point_history/user_point_history.service';
import { PaymentSessionService } from '../../payment_session/payment_session.service';
import { TransactionService } from '../../transaction/transaction.service';
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
import { PointActionType } from 'src/common/enums/points_action_type';
import { PointActionSoucre } from 'src/common/enums/point_action_source';
import { StoreStatus } from 'src/common/enums/store_status';
import { OrderPointsService } from './order_points.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { PaymentSession } from 'src/modules/payment_session/entities/payment_session.entity';
import { PayOrderDTO } from '../dto/pay-order-dto';
import { formatCardForApi } from 'src/common/utils/formatCardForApi';
import { PaymentCard } from 'src/modules/payment_card/entities/payment_card.entity';
import { StoreUtilsService } from 'src/modules/store/services/storeUtils.service';

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

        private readonly userPointHistoryService: UserPointHistoryService,
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
            const order = await this.orderRepo.findOne({ where: { id: orderId, customerId: customer.id }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            const store = await this.storeService.storeById(order.storeId);
            if (!store || store.status !== StoreStatus.APPROVED) {
                throw new BadRequestException(this.i18n.translate('translation.orders.store_unavailable', { lang }));
            }
            if(!order.scheduledAt)
            {
                const storeIsOpenNow = await this.storeUtilsService.isStoreOpenAt(store.id,new Date());
                if (!storeIsOpenNow) {
                    throw new BadRequestException(this.i18n.translate('translation.orders.store_closed_now', {lang,}),)
                }
            }

            if (order.scheduledAt && new Date(order.scheduledAt) <= new Date()) {
                throw new BadRequestException(this.i18n.translate('translation.orders.scheduled_in_past', { lang }),);
            }

            if (order.isPaid) throw new BadRequestException(this.i18n.translate('translation.orders.already_paid', { lang }));
            if (order.status !== OrderStatus.PENDING_PAYMENT) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_payment', { lang }));
            }

            if (order.pointsRedeemed > 0 && customer.points < MIN_POINTS_TO_USE) {
                throw new BadRequestException(this.i18n.translate('translation.orders.min_points_required', { lang }));
            }

            if (order.pointsRedeemed > customer.points && order.pointsRedeemed > 0) {
                throw new BadRequestException(this.i18n.translate('translation.orders.points_exceed_balance', { lang }));
            }

            const pointsValue = order.pointsAmountUsed;
            let amountLeftToPay = order.finalPriceToPay - pointsValue;

            if (amountLeftToPay <= 0) {
                // الدفع بالكامل بالنقاط
                order.orderNumber = await this.orderService.generateOrderNumber(order.storeId, transaction);
                await order.save({ transaction });
                await this.updateOrderPaymentInfo(order, transaction);
                await this.orderPointsService.handlePointsAfterPayment(customer.id, order.pointsRedeemed, order.id, transaction);
                await transaction.commit();
                this.orderNotificationService.notifyStore({orderId: order.id,status: order.status,storeId: order.storeId});
                await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.status,order.storeId,customer.name,lang);
                return { success: true, message: this.i18n.translate('translation.orders.paid_with_points', { lang }) };
            }

            if (order.paymentMethod === PaymentMethod.WALLET) {
                if (customer.walletBalance < amountLeftToPay) {
                    throw new BadRequestException(this.i18n.translate('translation.orders.wallet_insufficient', { lang }));
                }

                order.orderNumber = await this.orderService.generateOrderNumber(order.storeId, transaction);
                await order.save({ transaction });
                await this.customerService.detuctFromWallet(customer.id, amountLeftToPay, transaction);
                await this.updateOrderPaymentInfo(order, transaction);
                await this.orderPointsService.handlePointsAfterPayment(customer.id, order.pointsRedeemed, order.id, transaction);

                await this.transactionService.createTransaction({
                    customerId: customer.id,
                    amount: amountLeftToPay,
                    direction: 'OUT',
                    type: TransactionType.PURCHASE_WALLET,
                    orderId: order.id,
                }, transaction);
                this.orderNotificationService.notifyStore({orderId: order.id,status: order.status,storeId: order.storeId});
                await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.status,order.storeId,customer.name,lang);
                await transaction.commit();
                return { success: true, message: this.i18n.translate('translation.orders.paid_with_points_and_wallet', { lang }) };
            }

            if (order.paymentMethod === PaymentMethod.GATEWAY) {
                const {cvc,paymentCardId,newCard} = dto
                if(!cvc)
                {
                    throw new BadRequestException('You should send cvc of your card')
                }
                let card:PaymentCard;
                if (paymentCardId) {
                    card = await this.paymentCardService.getOne(paymentCardId, customer.id);
                } else if (newCard) {
                    if (newCard.isSave) {
                        card = await this.paymentCardService.create({ ...newCard, isDefault: false }, customer.id);
                    } else {
                        card = {
                            cardNumber: newCard.cardNumber,
                            expiryDate: newCard.expiryDate,
                            cardHolderName: newCard.cardHolderName,
                            cardName: newCard.cardName,
                            customerId: customer.id,
                        } as any; 
                    }
                    } else {
                        throw new BadRequestException('Either paymentCardId or newCard must be provided');
                    }
                const apiCard = formatCardForApi(card);
                await transaction.rollback();
                const { redirectUrl ,redirectMethod,redirectParams,paymentId} = await this.paymentSessionService.startPayment({
                    customer,
                    amount: amountLeftToPay,
                    provider: order.paymentGateway,
                    purpose: GatewaySource.order,
                    card: {
                        ...apiCard,
                        cvc
                    },
                    sourceId: order.id,
                });

                return { redirectUrl,redirectMethod,redirectParams,paymentId };
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async confirmOrderPayment(session: PaymentSession, lang: Language = Language.ar) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: session.orderId }, transaction });
            if (!order) {
                await transaction.rollback();
                throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));
            }

            order.orderNumber = await this.orderService.generateOrderNumber(order.storeId, transaction);
            await order.save({ transaction });
            await this.updateOrderPaymentInfo(order, transaction);
            await this.orderPointsService.validateAndRedeemPoints(order, transaction, lang);

            await this.transactionService.createTransaction({
                customerId: order.customerId,
                amount: session.amount ?? 0,
                direction: 'OUT',
                type: TransactionType.PURCHASE_GATEWAY,
                orderId: order.id,
            }, transaction);

            const customer = await this.customerService.findById(order.customerId);
            this.orderNotificationService.notifyStore({orderId: order.id,status: order.status,storeId: order.storeId});
            await this.orderNotificationService.sendNewOrderNotificationToStore(order.id,order.status,order.storeId,customer.name,lang);
            await transaction.commit();
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
        const totalRefundAmount = (order.walletAmountUsed || 0) + (order.gatewayAmountUsed || 0);

        if (totalRefundAmount > 0) {
            await this.customerService.addToWallet(order.customerId, totalRefundAmount, transaction);

            await this.transactionService.createTransaction({
                customerId: order.customerId,
                amount: totalRefundAmount,
                direction: 'IN',
                type: TransactionType.REFUND_WALLET,
                orderId: order.id,
            }, transaction);
        }

        if (order.pointsRedeemed && order.pointsRedeemed > 0) {
            await this.customerService.addPoints(order.customerId, order.pointsRedeemed, transaction);

            await this.userPointHistoryService.create({
                customerId: order.customerId,
                type: PointActionType.REFUND,
                source: PointActionSoucre.ORDER,
                points: order.pointsRedeemed,
                relatedOrderId: order.id,
            }, transaction);
        }

        order.status = newStatus;
        order.isPaid = false;
        order.canceledAt = new Date();
        await order.save({ transaction });
    }
}