import { OrderPaymentService } from './../order/services/order-payment.service';
import { TransactionService } from './../transaction/transaction.service';
import { PaymentSessionService } from './../payment_session/payment_session.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { generateHash } from 'src/common/utils/generateHash';
import { ConfigService } from '@nestjs/config';
import { verifyPaymentHash } from 'src/common/utils/verifyPaymentHash';

@Injectable()
export class EdfapayService {
    constructor(
        private paymentSessionService:PaymentSessionService,
        private transactionService:TransactionService,
        private orderPaymentService:OrderPaymentService,
        private configService: ConfigService
    ){}
    async handleNotification(body:any)
    {
        console.log(body)
        const { order_id, amount, currency, hash, status,trans_id} = body;
        if (!order_id || !amount || !currency || !hash || !status) {
            throw new BadRequestException('Invalid payload');
        }
        const session = await this.paymentSessionService.getByPaymentOrderId(order_id)
        console.log(session)
        if (session.status === 'success') {
            return { message: 'Payment already processed' };
        }
        const secretKey = this.configService.get<string>('EDFA_SECRET_KEY')!;
        console.log(secretKey)
        const generatedHash = verifyPaymentHash(
            order_id,
            amount,
            currency,
            session.description,
            secretKey
        );
        console.log(generatedHash)
        console.log(body.hash)
        if (body.hash !== generatedHash) {
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
