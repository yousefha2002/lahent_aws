import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order_status';
import { Op } from 'sequelize';
import { CONFIRMATION_EXTENSION_MINUTES, UNPAID_EXPIRATION_MINUTES } from 'src/common/constants';
import { OrderStatusService } from './order_status.service';
import { OrderNotificationService } from './orde_notification.service';
import { Language } from 'src/common/enums/language';

@Injectable()
export class OrderCronService{
    private readonly logger = new Logger(OrderCronService.name);

    constructor(
        @Inject(repositories.order_repository) private orderRepo: typeof Order,
        private readonly orderStatusService:OrderStatusService,
        private readonly orderNotificationService: OrderNotificationService
    ) {}

    /***  إلغاء الطلبات التي لم يتم دفعها خلال 30 دقيقة*/
    @Cron(CronExpression.EVERY_MINUTE)
    async expireUnpaidOrders() {
        const expirationTime = new Date(Date.now() - UNPAID_EXPIRATION_MINUTES * 60 * 1000);
        const orders = await this.orderRepo.findAll({
            where: {
                status: OrderStatus.PENDING_PAYMENT,
                createdAt: {
                    [Op.lt]: expirationTime,
                },
            },
        });
        for (const order of orders) {
            order.status = OrderStatus.EXPIRED_PAYMENT;
            order.canceledAt = new Date()
            await order.save();
            this.orderNotificationService.notifyCustomer({orderId: order.id,status: order.status,customerId: order.customerId});
        }
        if (orders.length) {
            this.logger.warn(`Expired ${orders.length} unpaid orders`);
        }
    }

    // تحديث الطلبات التي تجاوزت confirmationTimeoutAt ولا زالت PENDING_CONFIRMATION
    @Cron(CronExpression.EVERY_MINUTE)
    async updatePendingConfirmationOrders() 
    {
        const now = new Date();
        const orders = await this.orderRepo.findAll({
        where: {
            status: OrderStatus.PENDING_CONFIRMATION,
            confirmationTimeoutAt: {[Op.lt]: now, },
        },
        });

        for (const order of orders) {
            order.status = OrderStatus.CUSTOMER_DECISION;
            order.confirmationTimeoutAt = new Date(order.confirmationTimeoutAt.getTime() + CONFIRMATION_EXTENSION_MINUTES * 60 * 1000); // زيادة 3 دقائق
            await order.save();
            this.orderNotificationService.notifyCustomer({orderId: order.id,status: order.status,customerId: order.customerId});
        }

        if (orders.length) {
            this.logger.log(`Updated ${orders.length} orders from PENDING_CONFIRMATION to STATUS_DECISION`);
        }
    }

    /* الغاء الطلبات لو عد وقت confirmation at */
    @Cron(CronExpression.EVERY_MINUTE)
    async cancelExpiredCustomerDecision() {
        const now = new Date();

        const orders = await this.orderRepo.findAll({
            where: {
            status: OrderStatus.CUSTOMER_DECISION,
            confirmationTimeoutAt: { [Op.lt]: now },
            },
        });

        for (const order of orders) {
            await this.orderStatusService.refundOrder(order.id, { id: order.customerId } as any,Language.ar,OrderStatus.EXPIRED_CONFIRMATION);
        }

        if (orders.length) {
            this.logger.warn(`Cancelled ${orders.length} orders from CUSTOMER_DECISION due to timeout`);
        }
    }

    /**
     * تحديث حالة الطلبات التي في مرحلة التحضير (PREPARING) بناءً على الوقت المنقضي منذ بدء التحضير.
     * - إذا مر نصف الوقت المقدر للتحضير يتم تحديث الحالة إلى HALF_PREPARATION (نصف تحضير).
     * - إذا مر الوقت المقدر كاملاً يتم تحديث الحالة إلى READY (جاهز) وتسجيل وقت الجاهزية.
     * 
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async updatePreparingOrdersStatus() 
    {
        const now = new Date();

        const orders = await this.orderRepo.findAll({
        where: {
            status: {
                [Op.in]: [OrderStatus.PREPARING, OrderStatus.HALF_PREPARATION],
            },
            preparedAt: { [Op.ne]: null },
        },
        });

        for (const order of orders) {
            if (!order.preparedAt || !order.estimatedTime) continue;

            const preparedAtTime = order.preparedAt.getTime();
            const elapsedMs = now.getTime() - preparedAtTime;
            const estimatedMs = order.estimatedTime * 60 * 1000;

            if (elapsedMs >= estimatedMs) {
                // مضى الوقت الكامل => جاهز
                order.status = OrderStatus.READY;
                order.readyAt = now;
                await order.save();
                this.orderNotificationService.notifyBoth({orderId: order.id,status: order.status,customerId: order.customerId,storeId: order.storeId});
                this.logger.log(`Order ${order.id} status updated to READY`);
            } else if (elapsedMs >= estimatedMs / 2 && order.status !== OrderStatus.HALF_PREPARATION) {
                // مضى نصف الوقت => نصف تحضير
                order.status = OrderStatus.HALF_PREPARATION;
                await order.save();
                this.orderNotificationService.notifyBoth({orderId: order.id,status: order.status,customerId: order.customerId,storeId: order.storeId});
                this.logger.log(`Order ${order.id} status updated to HALF_PREPARING`);
            }
        }
    }

    /** تحويل الطلبات المجدولة ال preapred عند التقاء وقتها */
    @Cron(CronExpression.EVERY_MINUTE)
    async updateScheduledOrdersToPreparing() 
    {
        const now = new Date();

        const orders = await this.orderRepo.findAll({
            where: {
            status: OrderStatus.SCHEDULED,
            isScheduled: true,
            scheduledAt: { [Op.lte]: now }, 
            },
        });

        for (const order of orders) {
            order.status = OrderStatus.PREPARING;
            order.preparedAt = now;
            await order.save();
            this.orderNotificationService.notifyBoth({
                orderId: order.id,
                status: order.status,
                customerId: order.customerId,
                storeId: order.storeId,
            });
            this.logger.log(`Order ${order.id} moved from SCHEDULED to PREPARING at scheduled time.`);
        }
    }
}