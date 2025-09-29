import { FcmTokenService } from 'src/modules/fcm_token/fcm_token.service';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order_status';
import { Op, Sequelize } from 'sequelize';
import { CONFIRMATION_EXTENSION_MINUTES, UNPAID_EXPIRATION_MINUTES } from 'src/common/constants';
import { OrderStatusService } from './order_status.service';
import { OrderNotificationService } from './order_notification.service';
import { Language } from 'src/common/enums/language';
import { RoleStatus } from 'src/common/enums/role_status';
import { OrderNotifications } from 'src/common/notification/order-notifications';

@Injectable()
export class OrderCronService{
    private readonly logger = new Logger(OrderCronService.name);

    constructor(
        @Inject(repositories.order_repository) private orderRepo: typeof Order,
        private readonly orderStatusService:OrderStatusService,
        private readonly orderNotificationService: OrderNotificationService,
        private readonly fcmTokenService:FcmTokenService
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
            this.orderNotificationService.notifyCustomerSocket({orderId: order.id,status: order.status,customerId: order.customerId});
            await this.fcmTokenService.notifyUser(
                order.customerId,
                RoleStatus.CUSTOMER,
                OrderNotifications.ORDER_EXPIRED_PAYMENT.title[Language.ar],
                OrderNotifications.ORDER_EXPIRED_PAYMENT.body[Language.ar], 
                { orderId: order.id.toString(), status: order.status }
            );
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
            this.orderNotificationService.notifyCustomerSocket({orderId: order.id,status: order.status,customerId: order.customerId});
            await this.fcmTokenService.notifyUser(
                order.customerId,
                RoleStatus.CUSTOMER,
                OrderNotifications.ORDER_PENDING_CONFIRMATION.title[Language.ar],
                OrderNotifications.ORDER_PENDING_CONFIRMATION.body[Language.ar],
                { orderId: order.id.toString(), status: order.status }
            );
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

        for (const order of orders) 
        {
            if (!order.preparedAt || !order.estimatedTime) continue;

            const preparedAtTime = order.preparedAt.getTime();
            const elapsedMs = now.getTime() - preparedAtTime;
            const estimatedMs = order.estimatedTime * 60 * 1000;

            let newStatus: OrderStatus | null = null;

            if (elapsedMs >= estimatedMs && order.status !== OrderStatus.READY) {
                // مضى الوقت الكامل => جاهز
                newStatus = OrderStatus.READY;
                order.readyAt = now;
            } else if (elapsedMs >= estimatedMs / 2 && order.status !== OrderStatus.HALF_PREPARATION) {
                // مضى نصف الوقت => نصف تحضير
                newStatus = OrderStatus.HALF_PREPARATION;
            }

            if (newStatus) {
                order.status = newStatus;
                await order.save();

                // Real-time Socket Notification
                this.orderNotificationService.notifyBothSocket({
                    orderId: order.id,
                    status: order.status,
                    customerId: order.customerId,
                    storeId: order.storeId
                });

                await this.fcmTokenService.notifyUsers(
                    [
                        { userId: order.customerId, role: RoleStatus.CUSTOMER },
                        { userId: order.storeId, role: RoleStatus.STORE }
                    ],
                    OrderNotifications.ORDER_STATUS_UPDATE.title[Language.ar],
                    OrderNotifications.ORDER_STATUS_UPDATE.body[Language.ar](order.status),
                    { orderId: order.id.toString(), status: order.status }
                );
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
                [Op.and]: Sequelize.literal(
                    `NOW() >= DATE_SUB(scheduledAt, INTERVAL estimatedTime MINUTE)`
                ),
            },
        });

        if (!orders.length) return;

        const orderIds = orders.map(o => o.id);
        await this.orderRepo.update(
            { status: OrderStatus.PREPARING, preparedAt: now },
            { where: { id: orderIds } }
        );

        for (const order of orders) 
        {
            this.orderNotificationService.notifyBothSocket({orderId: order.id,status: OrderStatus.PREPARING,customerId: order.customerId,storeId: order.storeId});
            await this.fcmTokenService.notifyUsers(
                [
                    { userId: order.customerId, role: RoleStatus.CUSTOMER },
                    { userId: order.storeId, role: RoleStatus.STORE }
                ],
                OrderNotifications.ORDER_STATUS_UPDATE.title[Language.ar],
                OrderNotifications.ORDER_STATUS_UPDATE.body[Language.ar](OrderStatus.PREPARING),
                { orderId: order.id.toString(), status: OrderStatus.PREPARING }
            );
        }
    }

    /** الغاء الطلبات اذا عدى وقت scheduledAt وهي لسه في pending confirmation أو customer decision */
    @Cron(CronExpression.EVERY_MINUTE)
    async cancelExpiredScheduledConfirmations() 
    {
        const now = new Date();
        const orders = await this.orderRepo.findAll({
            where: {
            status: {
                [Op.in]: [OrderStatus.PENDING_CONFIRMATION, OrderStatus.CUSTOMER_DECISION],
            },
            scheduledAt: { [Op.lt]: now },
            },
        });
        for (const order of orders) {
            await this.orderStatusService.refundOrder(order.id, { id: order.customerId } as any,Language.ar,OrderStatus.EXPIRED_CONFIRMATION);
        }
    }
}