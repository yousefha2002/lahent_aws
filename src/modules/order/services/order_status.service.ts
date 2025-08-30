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
import { CONFIRMATION_EXTENSION_MINUTES, UNPAID_EXPIRATION_MINUTES } from 'src/common/constants';
import { Op } from 'sequelize';

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
        private readonly i18n: I18nService
    ){}

    async refundOrder(orderId: number, customer: Customer, lang: Language = Language.en) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, customerId: customer.id }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (!order.isPaid) throw new BadRequestException(this.i18n.translate('translation.orders.not_paid', { lang }));

            if (![OrderStatus.CUSTOMER_DECISION].includes(order.status)) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_refund', { lang }));
            }

            await this.orderPaymentService.processOrderRefund(order, OrderStatus.CANCELLED, transaction);

            await transaction.commit();
            return { success: true, message: this.i18n.translate('translation.orders.refund_success', { lang }) };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async rejectOrderByStore(orderId: number, storeId: number, lang: Language = Language.en) {
        const transaction = await this.sequelize.transaction();
        try {
            const order = await this.orderRepo.findOne({ where: { id: orderId, storeId }, transaction });
            if (!order) throw new NotFoundException(this.i18n.translate('translation.orders.not_found', { lang }));

            if (![OrderStatus.PENDING_CONFIRMATION, OrderStatus.CUSTOMER_DECISION].includes(order.status)) {
                throw new BadRequestException(this.i18n.translate('translation.orders.invalid_status_for_reject', { lang }));
            }

            await this.orderPaymentService.processOrderRefund(order, OrderStatus.REJECTED, transaction);

            await transaction.commit();
            return { success: true, message: this.i18n.translate('translation.orders.reject_success', { lang }) };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async acceptOrderByStore(orderId: number, storeId: number, lang: Language = Language.en) {
        const transaction = await this.sequelize.transaction();

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

            if (order.isScheduled) {
                order.status = OrderStatus.PLACED;
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
            await transaction.commit();

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

        const maxExtensionMinutes = 15;
        const currentTimeout = order.confirmationTimeoutAt.getTime();
        const now = Date.now();

        if (currentTimeout - now + extraMinutes * 60 * 1000 > maxExtensionMinutes * 60 * 1000) {
            throw new BadRequestException(this.i18n.translate('translation.orders.max_extension_exceeded', { lang }));
        }

        order.confirmationTimeoutAt = new Date(currentTimeout + extraMinutes * 60 * 1000);
        await order.save();

        return { success: true, message: this.i18n.translate('translation.orders.extended_success', { lang }) };
    }

    async expireUnpaidOrders() 
    {
        const expirationTime = new Date(Date.now() - UNPAID_EXPIRATION_MINUTES * 60 * 1000);
        const orders = await this.orderRepo.findAll({
        where: {
            status: OrderStatus.PENDING_PAYMENT,
            createdAt: { [Op.lt]: expirationTime },
        },
        });

        for (const order of orders) {
            order.status = OrderStatus.EXPIRED;
            order.canceledAt = new Date();
            await order.save();
        }
    }

    async updatePendingConfirmationOrders() 
    {
        const now = new Date();
        const orders = await this.orderRepo.findAll({
        where: {
            status: OrderStatus.PENDING_CONFIRMATION,
            confirmationTimeoutAt: { [Op.lt]: now },
        },
        });

        for (const order of orders) {
        order.status = OrderStatus.CUSTOMER_DECISION;
        order.confirmationTimeoutAt = new Date(order.confirmationTimeoutAt.getTime() + CONFIRMATION_EXTENSION_MINUTES * 60 * 1000);
        await order.save();
        }
    }

    async cancelExpiredCustomerDecision() 
    {
        const now = new Date();
        const orders = await this.orderRepo.findAll({
        where: {
            status: OrderStatus.CUSTOMER_DECISION,
            confirmationTimeoutAt: { [Op.lt]: now },
        },
        });

        for (const order of orders) {
        await this.refundOrder(order.id, { id: order.customerId } as any);
        }
    }

    async updatePreparingOrdersStatus() 
    {
        const now = new Date();
        const orders = await this.orderRepo.findAll({
        where: {
            status: { [Op.in]: [OrderStatus.PREPARING, OrderStatus.HALF_PREPARATION] },
            preparedAt: { [Op.ne]: null },
        },
        });

        for (const order of orders) {
        if (!order.preparedAt || !order.estimatedTime) continue;

        const elapsedMs = now.getTime() - order.preparedAt.getTime();
        const estimatedMs = order.estimatedTime * 60 * 1000;

        if (elapsedMs >= estimatedMs) {
            order.status = OrderStatus.READY;
            order.readyAt = now;
            await order.save();
        } else if (elapsedMs >= estimatedMs / 2 && order.status !== OrderStatus.HALF_PREPARATION) {
            order.status = OrderStatus.HALF_PREPARATION;
            await order.save();
        }
        }
    }

    async updateScheduledOrdersToPreparing() 
    {
        const now = new Date();
        const orders = await this.orderRepo.findAll({
        where: {
            status: OrderStatus.PLACED,
            isScheduled: true,
            scheduledAt: { [Op.lte]: now },
        },
        });

        for (const order of orders) {
        order.status = OrderStatus.PREPARING;
        order.preparedAt = now;
        await order.save();
        }
    }
}