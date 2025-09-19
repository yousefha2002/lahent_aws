import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { PaymentSession } from './entities/payment_session.entity';
import { PaymentGatewayFactory } from './payment_gateway.factory';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class PaymentSessionService {
    constructor(
        @Inject(repositories.payment_session_repository) private paymentSessionRepo: typeof PaymentSession,
    ){}

    async startPayment({ customer, amount, provider, purpose,sourceId}: { customer: Customer; amount: number; provider: string; purpose: GatewaySource;sourceId?:number }) 
    {
    // 1. إنشاء جلسة في DB
        const session = await this.paymentSessionRepo.create({
            customerId:customer.id,
            amount,
            provider,
            purpose,
            status: 'pending',
            loyaltyOfferId:purpose===GatewaySource.wallet?sourceId:null,
            orderId:purpose===GatewaySource.order?sourceId:null
        });

        // 2. بناء callbackUrl بعد معرفة sessionId
        const callbackUrl = `https://myapp.com/api/payment/callback/${session.id}`;

        // 3. إنشاء الدفع مع البوابة
        const gateway = PaymentGatewayFactory.getProvider(provider);
        const { checkoutUrl,paymentOrderId ,description,currency,hash} = await gateway.createPayment(amount, 'SAR', callbackUrl,customer);
        session.paymentOrderId = paymentOrderId;
        session.description = description
        session.hash = hash
        session.currency = currency
        
        await session.save()
        return { checkoutUrl};
    }

    async getByPaymentOrderId(paymentOrderId: string) {
        const session = await this.paymentSessionRepo.findOne({ where: { paymentOrderId } });
        if (!session) throw new NotFoundException('Payment session not found');
        return session;
    }

    findAll()
    {
        return this.paymentSessionRepo.findAll()
    }
}
