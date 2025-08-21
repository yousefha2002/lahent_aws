import { Module } from '@nestjs/common';
import { EdfapayService } from './edfapay.service';
import { EdfapayController } from './edfapay.controller';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  controllers: [EdfapayController],
  providers: [EdfapayService],
  imports:[TransactionModule]
})
export class EdfapayModule {}
