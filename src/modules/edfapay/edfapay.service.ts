import { OrderPaymentService } from './../order/services/order-payment.service';
import { TransactionService } from './../transaction/transaction.service';
import { PaymentSessionService } from './../payment_session/payment_session.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GatewaySource } from 'src/common/enums/gateway-source';

@Injectable()
export class EdfapayService {
    constructor(
        private paymentSessionService:PaymentSessionService,
        private transactionService:TransactionService,
        private orderPaymentService:OrderPaymentService
    ){}
    async handleNotification(body:any)
    {
        const { order_id, amount, currency, hash, status,trans_id } = body;
        if (!order_id || !amount || !currency || !hash || !status) {
            throw new BadRequestException('Invalid payload');
        }
        const paymentorderId = order_id??"5305e75d-ea36-415c-aeb8-02bfd97b9e26"
        const session = await this.paymentSessionService.getByPaymentOrderId(paymentorderId)
        if (hash !== session.hash) {
            throw new BadRequestException('Invalid hash');
        }
        session.transactionId = trans_id;
        if (status === 'SETTLED' || status === 'SUCCESS')
        {
            session.status = 'success';
            if(session.purpose === GatewaySource.wallet)
            {
                await this.transactionService.confirmChargeWallet(session)
            }
            else if(session.purpose === GatewaySource.order)
            {
                await this.orderPaymentService.confirmOrderPayment(session)
            }
        }
        else if (status === 'FAILED') {
            session.status = 'failed';
        } else {
            session.status = 'pending';
        }
        await session.save();
        return { message: `Payment ${session.status}` };
    }
}
