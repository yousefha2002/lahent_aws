import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeletionService } from './deletion.service';

@Injectable()
export class DeletionCronService {
    private readonly logger = new Logger(DeletionCronService.name);

    constructor(private readonly deletionService: DeletionService) {}

    // Cron يعمل كل يوم عند منتصف الليل
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteOldSoftDeletedStores() {
        try {
            const result = await this.deletionService.hardDeleteStoresOlderThan(30);
            if (result.deletedCount) {
                this.logger.log(`Hard deleted ${result.deletedCount} old soft-deleted stores`);
            } else {
                this.logger.log(`No old soft-deleted stores found`);
            }
        } catch (error) {
            this.logger.error('Error deleting old soft-deleted stores', error);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteOldSoftDeletedCustomers() {
        try {
            const result = await this.deletionService.hardDeleteCustomersOlderThan(30);
            if (result.deletedCount) {
                this.logger.log(`Hard deleted ${result.deletedCount} old soft-deleted customers`);
            } else {
                this.logger.log(`No old soft-deleted customers found`);
            }
        } catch (error) {
            this.logger.error('Error deleting old soft-deleted customers', error);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteOldSoftDeletedOwners() {
        try {
            const result = await this.deletionService.hardDeleteOwnersOlderThan(30);
            if (result.deletedCount) {
            this.logger.log(`Hard deleted ${result.deletedCount} old soft-deleted owners`);
            } else {
            this.logger.log(`No old soft-deleted owners found`);
            }
        } catch (error) {
            this.logger.error('Error deleting old soft-deleted owners', error);
        }
    }
}