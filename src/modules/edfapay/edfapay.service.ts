import { TransactionService } from './../transaction/transaction.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EdfapayService {
    constructor(
        private transactionService:TransactionService
    ){}
    async handleNotification()
    {
        // await this.transactionService.confirmCharge(1)
        return {mesg:"success"}
    }
}
