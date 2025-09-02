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

        try {
        // إزالة جميع الـ repeatable jobs القديمة
        const repeatableJobs = await this.orderQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.orderQueue.removeRepeatableByKey(job.key);
        }

        // إضافة الـ jobs الجديدة مع jobId لتجنب التكرار
        const jobs = [
            'expire-unpaid-orders',
            'update-pending-confirmation',
            'cancel-expired-customer-decision',
            'update-preparing-orders',
            'update-scheduled-to-preparing',
        ];

        for (const name of jobs) {
            try {
            await this.orderQueue.add(
                name,
                {},
                { jobId: name, repeat: { cron } }
            );
            } catch (err) {
            console.error(`Failed to add job ${name}:`, err);
            }
        }
        } catch (err) {
        console.error('Failed to schedule repeatable jobs:', err);
        }
    }
}