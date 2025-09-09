import { OrderPaymentService } from './../order/services/order-payment.service';
import { TransactionService } from './../transaction/transaction.service';
import { PaymentSessionService } from './../payment_session/payment_session.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { PaymentGatewayFactory } from '../payment_session/payment_gateway.factory';
import { GatewayType } from 'src/common/enums/gatewat_type';

@Injectable()
export class EdfapayService {
    constructor(
        private paymentSessionService:PaymentSessionService,
        private transactionService:TransactionService,
        private orderPaymentService:OrderPaymentService,
    ){}

    async handleNotification(body: any) 
    {
        const { order_id, status, trans_id } = body;

        if (!order_id || !trans_id || !status) {
            throw new BadRequestException('Invalid payload');
        }

        const session = await this.paymentSessionService.getByPaymentOrderId(order_id);

        if (session.status === 'success') {
            return { message: 'Payment already processed' };
        }

        session.transactionId = trans_id;
        const gateway = PaymentGatewayFactory.getProvider(GatewayType.edfapay);
        console.log(gateway)

        let isSettled = false;
        if (status === 'SETTLED' || status === 'SUCCESS') {
            isSettled = await gateway.confirmPayment(order_id, trans_id, session.hash);
        }

        if (isSettled) {
            session.status = 'success';
            if (session.purpose === GatewaySource.wallet) {
                await this.transactionService.confirmChargeWallet(session);
            } else if (session.purpose === GatewaySource.order) {
                await this.orderPaymentService.confirmOrderPayment(session);
            }
        } else if (status === 'FAILED') {
            session.status = 'failed';
        } else {
            session.status = 'pending';
        }

        await session.save();

        return { message: `Payment ${session.status}` };
    }
}
