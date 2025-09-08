import { Module } from '@nestjs/common';
import { StoreCommissionService } from './store_commission.service';
import { StoreCommissionController } from './store_commission.controller';

@Module({
  controllers: [StoreCommissionController],
  providers: [StoreCommissionService],
})
export class StoreCommissionModule {}
