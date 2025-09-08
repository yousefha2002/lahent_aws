import { Module } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { StoreTransactionController } from './store_transaction.controller';

@Module({
  controllers: [StoreTransactionController],
  providers: [StoreTransactionService],
})
export class StoreTransactionModule {}
