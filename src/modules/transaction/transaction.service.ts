import { PaymentCardService } from './../payment_card/payment_card.service';
import { CustomerService } from './../customer/customer.service';
import { PaymentSessionService } from './../payment_session/payment_session.service';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Transaction } from './entities/transaction.entity';
import { LoyaltyOfferService } from '../loyalty_offer/loyalty_offer.service';
import { ChargeWalletDTO } from './dto/charge-wallet.dto';
import { TransactionType } from 'src/common/enums/transaction_type';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { filterTypeTransaction } from 'src/common/types/filter-type-transaction';
import { Order } from '../order/entities/order.entity';
import { Gift } from '../gift/entities/gift.entity';
import { LoyaltyOffer } from '../loyalty_offer/entites/loyalty_offer.entity';
import { Store } from '../store/entities/store.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Avatar } from '../avatar/entities/avatar.entity';
import { PaymentSession } from '../payment_session/entities/payment_session.entity';
import { Op } from 'sequelize';
import { formatCardForApi } from 'src/common/utils/formatCardForApi';
import { PaymentCard } from '../payment_card/entities/payment_card.entity';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(repositories.transaction_repository)
    private transactionRepo: typeof Transaction,
    private readonly loyaltyOfferService: LoyaltyOfferService,

    @Inject(forwardRef(() => PaymentSessionService))
    private readonly paymentSessionService: PaymentSessionService,

    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,

    private readonly paymentCardService:PaymentCardService
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
    const { redirectParams,redirectUrl ,redirectMethod} =await this.paymentSessionService.startPayment({
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
    return { redirectParams,redirectUrl,redirectMethod };
  }

  async confirmChargeWallet(session: PaymentSession) {
    await this.createTransaction({
      customerId: session.customerId,
      amount: session.amount,
      direction: 'IN',
      type: TransactionType.TOP_UP,
      loyaltyOfferId: session.loyaltyOfferId,
    });
    await this.customerService.addToWallet(session.customerId,session.amount);
  }

  async createTransaction(
    params: {
      customerId: number;
      amount: number;
      direction: 'IN' | 'OUT';
      type: TransactionType;
      orderId?: number;
      giftId?: number;
      loyaltyOfferId?: number;
    },
    transaction?: any,
  ) {
    return this.transactionRepo.create(
      params,
      transaction ? { transaction } : undefined,
    );
  }

  async getTransactions(customerId: number,typeFilter: 'all' | 'deposit' | 'purchase' | 'refund' | 'gift' = 'all',page = 1,limit = 10,) {
    const offset = (page - 1) * limit;

    const where: any = { customerId };

    // فلترة حسب النوع
    if (typeFilter === 'deposit') {
      where.type = TransactionType.TOP_UP;
    } else if (typeFilter === 'purchase') {
      where.type = { [Op.in]: [TransactionType.PURCHASE_GATEWAY, TransactionType.PURCHASE_WALLET] };
    } else if (typeFilter === 'refund') {
      where.type = TransactionType.REFUND_WALLET;
    } else if (typeFilter === 'gift') {
      where.type = { [Op.in]: [TransactionType.GIFT_SENT, TransactionType.GIFT_RECEIVED] };
    }

    const { rows, count } = await this.transactionRepo.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
      include: [
        { model: Order, include: [Store] },
        {
          model: Gift,
          include: [
            { model: Customer, as: 'sender', include: [Avatar] },
            { model: Customer, as: 'receiver', include: [Avatar] },
          ],
        },
        { model: LoyaltyOffer },
      ],
    });

    // تجهيز الداتا
    const dataWithOtherParty = rows.map((tx) => {
      const plainTx = tx.toJSON();

      if (plainTx.gift) {
        const isSent = plainTx.type === TransactionType.GIFT_SENT;
        const relatedCustomer = isSent ? plainTx.gift.receiver : plainTx.gift.sender;
        const fallbackName = isSent ? plainTx.gift.receiverName : plainTx.gift.senderName;
        const fallbackPhone = isSent ? plainTx.gift.receiverPhone : plainTx.gift.senderPhone;

        plainTx.gift.otherParty = {
          id: relatedCustomer?.id || null,
          name: relatedCustomer?.name || fallbackName || 'Unknown',
          phone: relatedCustomer?.phone || fallbackPhone || 'N/A',
          imageUrl: relatedCustomer?.imageUrl || null,
          avatar: relatedCustomer?.avatar
            ? { id: relatedCustomer.avatar.id, url: relatedCustomer.avatar.url }
            : null,
        };
      }

      return plainTx;
    });

    return {
      data: dataWithOtherParty,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}
