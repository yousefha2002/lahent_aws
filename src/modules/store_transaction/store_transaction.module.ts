import { StoreCommissionModule } from './../store_commission/store_commission.module';
import { Module } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { StoreTransactionController } from './store_transaction.controller';
import { StoreTransactionProvider } from './providers/store_transaction.provider';

@Module({
  controllers: [StoreTransactionController],
  providers: [StoreTransactionService,...StoreTransactionProvider],
  imports:[StoreCommissionModule],
  exports:[StoreTransactionService]
})
export class StoreTransactionModule {}
