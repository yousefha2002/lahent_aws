import { Module } from '@nestjs/common';
import { StoreCommissionService } from './store_commission.service';
import { StoreCommissionController } from './store_commission.controller';
import { StoreCommissionProvider } from './providers/store_commission.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [StoreCommissionController],
  providers: [StoreCommissionService,...StoreCommissionProvider],
  imports:[AdminModule],
  exports:[StoreCommissionService]
})
export class StoreCommissionModule {}
