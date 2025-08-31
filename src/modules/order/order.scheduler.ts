import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class OrderQueueScheduler {
    constructor(@InjectQueue('orders') private readonly orderQueue: Queue) {}

    // async onApplicationBootstrap() {
    //     await this.scheduleJobs();
    // }

    async scheduleJobs() {
        const cron = '* * * * *'; // كل دقيقة
        await this.orderQueue.add('expire-unpaid-orders', {}, { repeat: { cron } });
        await this.orderQueue.add('update-pending-confirmation', {}, { repeat: { cron } });
        await this.orderQueue.add('cancel-expired-customer-decision', {}, { repeat: { cron } });
        await this.orderQueue.add('update-preparing-orders', {}, { repeat: { cron } });
        await this.orderQueue.add('update-scheduled-to-preparing', {}, { repeat: { cron } });
    }
}