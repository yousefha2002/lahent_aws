import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class OrderQueueScheduler implements OnApplicationBootstrap {
    constructor(@InjectQueue('orders') private readonly orderQueue: Queue) {}

    async onApplicationBootstrap() {
        await this.scheduleJobs();
    }

    async scheduleJobs() {
        const cron = '* * * * *'; // كل دقيقة
        const repeatableJobs = await this.orderQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.orderQueue.removeRepeatableByKey(job.key);
        }

        await this.orderQueue.add('expire-unpaid-orders', {}, { jobId: 'expire-unpaid-orders', repeat: { cron } });
        await this.orderQueue.add('update-pending-confirmation', {}, { jobId: 'update-pending-confirmation', repeat: { cron } });
        await this.orderQueue.add('cancel-expired-customer-decision', {}, { jobId: 'cancel-expired-customer-decision', repeat: { cron } });
        await this.orderQueue.add('update-preparing-orders', {}, { jobId: 'update-preparing-orders', repeat: { cron } });
        await this.orderQueue.add('update-scheduled-to-preparing', {}, { jobId: 'update-scheduled-to-preparing', repeat: { cron } });
    }
}