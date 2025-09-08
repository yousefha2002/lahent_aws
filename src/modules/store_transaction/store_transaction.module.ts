import { Module } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { StoreTransactionController } from './store_transaction.controller';
import { StoreTransactionProvider } from './providers/store_transaction.provider';

@Module({
  controllers: [StoreTransactionController],
  providers: [StoreTransactionService,...StoreTransactionProvider],
})
export class StoreTransactionModule {}
