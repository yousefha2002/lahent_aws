import { Controller } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';

@Controller('store-transaction')
export class StoreTransactionController {
  constructor(private readonly storeTransactionService: StoreTransactionService) {}
}
