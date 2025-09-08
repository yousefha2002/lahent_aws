import { CustomerService } from './../customer/customer.service';
import { PaymentSessionService } from './../payment_session/payment_session.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
  ) {}

  async chargeWallet(loyaltyOfferId: number,customer: Customer,dto: ChargeWalletDTO,) 
  {
    const { gateway } = dto;
    const offer = await this.loyaltyOfferService.findByIdIfActive(loyaltyOfferId);
    const { checkoutUrl} =await this.paymentSessionService.startPayment({customer,amount: offer.amountRequired,provider: gateway,purpose: GatewaySource.wallet,sourceId: loyaltyOfferId});
    return { checkoutUrl};
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

  async getTransactions(customerId: number,typeFilter: filterTypeTransaction = "all",page = 1,limit = 10)
  {
    const offset = (page - 1) * limit;

    const where: any = { customerId };

    if (typeFilter === 'deposit') {
      where.type = [TransactionType.TOP_UP];
    } else if (typeFilter === 'purchase') {
      where.type = [TransactionType.PURCHASE_GATEWAY, TransactionType.PURCHASE_WALLET];
    } else if (typeFilter === 'refund') {
      where.type = [TransactionType.REFUND_WALLET];
    }
    else if(typeFilter==='gift')
    {
      where.type = [TransactionType.GIFT_SENT,TransactionType.GIFT_RECEIVED];
    }

    const { rows, count } = await this.transactionRepo.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
      include: [
        { model: Order, include: [Store] },
        { model: Gift, include: [{ model: Customer, as: 'sender',include:[Avatar] }, { model: Customer, as: 'receiver',include:[Avatar] }] },
        { model: LoyaltyOffer },
      ],
    });

    const dataWithOtherParty = rows.map(tx => {
    const plainTx = tx.toJSON();

    if (plainTx.type === TransactionType.GIFT_SENT && plainTx.gift?.receiver) {
      plainTx.gift.otherParty = {
        id: plainTx.gift.receiver.id,
        name: plainTx.gift.receiver.name,
        phone: plainTx.gift.receiver.phone,
        imageUrl: plainTx.gift.receiver.imageUrl,
        avatar: plainTx.gift.receiver.avatar
          ? { id: plainTx.gift.receiver.avatar.id, url: plainTx.gift.receiver.avatar.url }
          : null,
      };
    } else if (plainTx.type === TransactionType.GIFT_RECEIVED && plainTx.gift?.sender) {
      plainTx.gift.otherParty = {
        id: plainTx.gift.sender.id,
        name: plainTx.gift.sender.name,
        phone: plainTx.gift.sender.phone,
        imageUrl: plainTx.gift.sender.imageUrl,
        avatar: plainTx.gift.sender.avatar
          ? { id: plainTx.gift.sender.avatar.id, url: plainTx.gift.sender.avatar.url }
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
