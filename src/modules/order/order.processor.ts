import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { OrderStatusService } from './services/order_status.service';

@Processor('orders')
export class OrderProcessor {
    constructor(private readonly orderStatusService: OrderStatusService) {}

    @Process('expire-unpaid-orders')
    async expireUnpaidOrders(job: Job) {
        await this.orderStatusService.expireUnpaidOrders();
    }

    @Process('update-pending-confirmation')
    async updatePendingConfirmationOrders(job: Job) {
        await this.orderStatusService.updatePendingConfirmationOrders();
    }

    @Process('cancel-expired-customer-decision')
    async cancelExpiredCustomerDecision(job: Job) {
        await this.orderStatusService.cancelExpiredCustomerDecision();
    }

    @Process('update-preparing-orders')
    async updatePreparingOrdersStatus(job: Job) {
        await this.orderStatusService.updatePreparingOrdersStatus();
    }

    @Process('update-scheduled-to-preparing')
    async updateScheduledOrdersToPreparing(job: Job) {
        await this.orderStatusService.updateScheduledOrdersToPreparing();
    }
}