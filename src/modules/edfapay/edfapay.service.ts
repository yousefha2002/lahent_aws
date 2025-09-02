import { OrderPaymentService } from './../order/services/order-payment.service';
import { TransactionService } from './../transaction/transaction.service';
import { PaymentSessionService } from './../payment_session/payment_session.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { ConfigService } from '@nestjs/config';
import {generateHash, generateWebhookHash } from 'src/common/utils/generateHash';

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
        const { order_id, amount, currency, hash, status,trans_id} = body;
        if (!order_id || !amount || !currency || !hash || !status) {
            throw new BadRequestException('Invalid payload');
        }
        const session = await this.paymentSessionService.getByPaymentOrderId(order_id)
        if (session.status === 'success') {
            return { message: 'Payment already processed' };
        }
        const secretKey = this.configService.get<string>('EDFA_SECRET_KEY')!;
        const generatedHash = generateWebhookHash(
            String(order_id),
            String(amount),
            String(currency),
            String(session.description),
            String(secretKey)
        )
        
        console.log("👉 hash from webhook:", body.hash);
        console.log("👉 hash from generatedHash:", generatedHash);
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
