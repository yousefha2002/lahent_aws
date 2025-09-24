import { StoreTransactionService } from './../../store_transaction/store_transaction.service';
import { OrderNotificationService } from './orde_notification.service';
import { ProductService } from './../../product/product.service';
import { CouponService } from './../../coupon/coupon.service';
import { OfferService } from './../../offer/offer.service';
import { OrderPaymentService } from './order-payment.service';
import { UserPointHistoryService } from '../../user_point_history/user_point_history.service';
import { CustomerService } from '../../customer/customer.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order_status';
import { Customer } from '../../customer/entities/customer.entity';
import { Sequelize } from 'sequelize';
import { PointActionType } from 'src/common/enums/points_action_type';
import { PointActionSoucre } from 'src/common/enums/point_action_source';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { AcceptOrderDto } from '../dto/accept-order.dto';

@Injectable()
export class OrderStatusService {
    constructor(
        @Inject(repositories.order_repository) private orderRepo: typeof Order,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly customerService: CustomerService,
        private readonly userPointHistoryService: UserPointHistoryService,
        private orderPaymentService: OrderPaymentService,
        private offerService: OfferService,
        private couponService: CouponService,
        private productService: ProductService,
        private readonly i18n: I18nService,
        private readonly orderNotificationService:OrderNotificationService,
        private readonly storeTransactionService:StoreTransactionService,
    ){}

    async refundOrder(orderId: number, customer: Customer,lang: Language = Language.ar,status:OrderStatus=OrderStatus.CANCELLED) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, customerId: customer.id }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (!order.isPaid) throw new BadRequestException(this.i18n.translate('translation.orders.not_paid', { lang }));

            if (![OrderStatus.CUSTOMER_DECISION].includes(order.status)) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_refund', { lang }));
            }

            await this.orderPaymentService.processOrderRefund(order,status, transaction);
            await this.storeTransactionService.create({storeId:order.storeId,orderId:order.id,totalAmount:order.finalPriceToPay,status:StoreTransactionType.CANCELED},transaction);

            await transaction.commit();
            this.orderNotificationService.notifyBoth({orderId: order.id,status,customerId: order.customerId,storeId: order.storeId});
            return { success: true, message: this.i18n.translate('translation.orders.refund_success', { lang }) };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async rejectOrderByStore(orderId: number, storeId: number, lang: Language = Language.ar) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, storeId }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (![OrderStatus.PENDING_CONFIRMATION, OrderStatus.CUSTOMER_DECISION].includes(order.status)) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_reject', { lang }));
            }

            await this.orderPaymentService.processOrderRefund(order, OrderStatus.REJECTED, transaction);
            await this.storeTransactionService.create({storeId,orderId:order.id,totalAmount:order.finalPriceToPay,status:StoreTransactionType.CANCELED},transaction);

            this.orderNotificationService.notifyCustomer({orderId: order.id,status: OrderStatus.REJECTED,customerId: order.customerId});
            await transaction.commit();
            return { success: true, message: this.i18n.translate('translation.orders.reject_success', { lang }) };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async acceptOrderByStore(orderId: number, storeId: number,dto:AcceptOrderDto, lang: Language) {
        const transaction = await this.sequelize.transaction();
        const {extraMinutes} = dto
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, storeId }, include:[OrderItem], transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (![OrderStatus.PENDING_CONFIRMATION, OrderStatus.CUSTOMER_DECISION].includes(order.status)) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_accept', { lang }));
            }

            for (const item of order.orderItems) {
                if (item.offerId) {
                    this.offerService.increamntOfferCount(item.offerId, transaction);
                }
                await this.productService.incrementSales(item.productId, item.quantity, transaction);
            }

            if (order.couponId) {
                this.couponService.increamntOCouponCount(order.couponId, transaction);
            }

            order.placedAt = new Date();
            if(extraMinutes)
            {
                order.estimatedTime+=extraMinutes
            }

            if (order.isScheduled) {
                order.status = OrderStatus.SCHEDULED;
            } else {
                order.status = OrderStatus.PREPARING;
                order.preparedAt = new Date()
            }

            if (order.pointsEarned && order.pointsEarned > 0) {
                await this.customerService.addPoints(order.customerId, order.pointsEarned, transaction);
                await this.userPointHistoryService.create({
                    customerId: order.customerId,
                    type: PointActionType.EARNED,
                    source: PointActionSoucre.ORDER,
                    points: order.pointsEarned,
                    relatedOrderId: order.id,
                }, transaction);
            }

            await order.save({ transaction });
            await this.storeTransactionService.create({storeId,orderId:order.id,totalAmount:order.finalPriceToPay,status:StoreTransactionType.COMPLETED},transaction);
            await transaction.commit();
            this.orderNotificationService.notifyCustomer({orderId: order.id,status: order.status,customerId: order.customerId});

            return { success: true, message: this.i18n.translate('translation.orders.accept_success', { lang }) };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async markOrderReady(orderId: number, storeId: number, lang: Language = Language.en) {
        const order = await this.orderRepo.findOne({ where: { id: orderId, storeId } });
        if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

        if (![OrderStatus.PREPARING, OrderStatus.HALF_PREPARATION].includes(order.status)) {
            throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_ready', { lang }));
        }

        order.readyAt = new Date();
        order.status = OrderStatus.READY;

        await order.save();
        this.orderNotificationService.notifyCustomer({orderId: order.id,status: order.status,customerId: order.customerId});

        return { message: this.i18n.translate('translation.orders.ready_success', { lang }), order };
    }

    async markOrderArrived(orderId: number, customerId: number, lang: Language = Language.en) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, customerId }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (order.status !== OrderStatus.READY) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_arrived', { lang }));
            }

            order.status = OrderStatus.ARRIVED;
            order.arrivedAt = new Date();

            await order.save({ transaction });
            await transaction.commit();

            this.orderNotificationService.notifyStore({orderId: order.id,status: order.status,storeId: order.storeId});
            return { success: true, message: this.i18n.translate('translation.orders.arrived_success', { lang }) };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async markOrderReceived(orderId: number, customerId: number, lang: Language = Language.en) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, customerId }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (order.status !== OrderStatus.ARRIVED) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_received', { lang }));
            }

            order.status = OrderStatus.RECEIVED;
            order.receivedAt = new Date();

            await order.save({ transaction });
            await transaction.commit();
            this.orderNotificationService.notifyStore({orderId: order.id,status: order.status,storeId: order.storeId});

            return { success: true, message: this.i18n.translate('translation.orders.received_success', { lang }) };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async extendCustomerDecisionTimeout(orderId: number, customerId: number, extraMinutes: number, lang: Language = Language.en) {
        const order = await this.orderRepo.findOne({ where: { id: orderId, customerId } });
        if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

        if (order.status !== OrderStatus.CUSTOMER_DECISION) {
            throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_extend', { lang }));
        }

        if (order.hasExtended) {
            throw new BadRequestException(this.i18n.translate('translation.orders.already_extended', { lang }));
        }

        const maxExtensionMinutes = 60;
        const currentTimeout = order.confirmationTimeoutAt.getTime();
        const now = Date.now();

        if (currentTimeout - now + extraMinutes * 60 * 1000 > maxExtensionMinutes * 60 * 1000) {
            throw new BadRequestException(this.i18n.translate('translation.orders.max_extension_exceeded', { lang }));
        }

        order.confirmationTimeoutAt = new Date(currentTimeout + extraMinutes * 60 * 1000);
        order.hasExtended = true;
        await order.save();

        return { success: true, message: this.i18n.translate('translation.orders.extended_success', { lang }) };
    }

    async markCustomerOnTheWay(orderId: number, customerId: number, lang: Language = Language.en) 
    {
        const order = await this.orderRepo.findOne({ where: { id: orderId, customerId } });
        if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

        if (![OrderStatus.PREPARING, OrderStatus.READY].includes(order.status)) {
            throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_on_the_way', { lang }));
        }
        this.orderNotificationService.notifyStore({orderId: order.id,status: 'customer_on_the_way',storeId: order.storeId});

        return { success: true, message: this.i18n.translate('translation.orders.customer_on_the_way', { lang }) };
    }
}