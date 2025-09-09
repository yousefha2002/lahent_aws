import { StoreCommissionModule } from './../store_commission/store_commission.module';
import { Module } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { StoreTransactionProvider } from './providers/store_transaction.provider';
import { StoreTransactionController } from './store_transaction.controller';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';

@Module({
  controllers: [StoreTransactionController],
  providers: [StoreTransactionService,...StoreTransactionProvider],
  imports:[StoreCommissionModule,StoreModule,OwnerModule],
  exports:[StoreTransactionService]
})
export class StoreTransactionModule {}
