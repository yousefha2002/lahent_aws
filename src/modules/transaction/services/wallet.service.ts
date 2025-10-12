import { TransactionService } from './transaction.service';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { TransactionType } from 'src/common/enums/transaction_type';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { formatCardForApi } from 'src/common/utils/formatCardForApi';
import { LoyaltyOfferService } from 'src/modules/loyalty_offer/loyalty_offer.service';
import { PaymentSessionService } from 'src/modules/payment_session/payment_session.service';
import { CustomerService } from 'src/modules/customer/customer.service';
import { PaymentCardService } from 'src/modules/payment_card/payment_card.service';
import { PaymentCard } from 'src/modules/payment_card/entities/payment_card.entity';
import { ChargeWalletDTO } from '../dto/charge-wallet.dto';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { PaymentSession } from 'src/modules/payment_session/entities/payment_session.entity';
import { ChargeWalletApplePayDTO } from '../dto/charge-wallet-apple-pay.dto';
import { PaymentGatewayFactory } from 'src/modules/payment_session/payment_gateway.factory';

@Injectable()
export class WalletService {
  constructor(
    private readonly loyaltyOfferService: LoyaltyOfferService,

    @Inject(forwardRef(() => PaymentSessionService))
    private readonly paymentSessionService: PaymentSessionService,

    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,

    private readonly paymentCardService:PaymentCardService,
    private readonly transactionService:TransactionService
  ) {}

  async chargeWallet(loyaltyOfferId: number,customer: Customer,dto: ChargeWalletDTO,) 
  {
    const { gateway,paymentCardId ,cvc,newCard} = dto;
    const offer = await this.loyaltyOfferService.findByIdIfActive(loyaltyOfferId);
    let card: PaymentCard;
    if(paymentCardId)
    {
      card = await this.paymentCardService.getOne(paymentCardId, customer.id)
    }
    else if(newCard)
    {
      if (newCard.isSave)
      {
        card = await this.paymentCardService.create({...newCard,isDefault:false},customer.id)
      }
      else{
        card = {
          cardNumber: newCard.cardNumber,
          expiryDate: newCard.expiryDate,
          cardHolderName: newCard.cardHolderName,
          cardName: newCard.cardName,
          customerId: customer.id,
        } as PaymentCard;
      }
    }
    else {
      throw new BadRequestException('Either paymentCardId or newCard must be provided');
    }
    const apiCard = formatCardForApi(card);
    const { redirectParams,redirectUrl ,redirectMethod,paymentId} =await this.paymentSessionService.startPayment({
      customer,
      amount: offer.amountRequired,
      provider: gateway,
      purpose: GatewaySource.wallet,
      card: {
        ...apiCard,
        cvc
      },
      sourceId: loyaltyOfferId,
    });
    return { redirectParams,redirectUrl,redirectMethod,paymentId };
  }

    async confirmChargeWallet(session: PaymentSession) {
        await this.transactionService.createTransaction({
        customerId: session.customerId,
        amount: session.amount,
        direction: 'IN',
        type: TransactionType.TOP_UP,
        loyaltyOfferId: session.loyaltyOfferId,
        });
        await this.customerService.addToWallet(session.customerId,session.amount);
    }

    async chargeWalletWithApplePay(loyaltyOfferId: number, customer: Customer, dto: ChargeWalletApplePayDTO) 
    {
    const {gateway,applePayPayment} = dto
    const payemntGateway = PaymentGatewayFactory.getProvider(gateway);
    const offer = await this.loyaltyOfferService.findByIdIfActive(loyaltyOfferId);

    // استخدم خدمة Apple Pay الخاصة بك
    const result = await payemntGateway.createApplePayPayment(
      offer.amountRequired,
      'SAR',
      'https://lahent.sa/api',
      customer,
      applePayPayment
    );

    if (result !== true) {
      throw new BadRequestException('Apple Pay payment failed');
    }
    await this.customerService.addToWallet(customer.id,offer.amountRequired);
    await this.transactionService.createTransaction({
        customerId: customer.id,
        amount: offer.amountRequired,
        direction: 'IN',
        type: TransactionType.TOP_UP,
        loyaltyOfferId: loyaltyOfferId,
      });
    return { success: true, message: 'Wallet charged successfully via Apple Pay' };
  }
}