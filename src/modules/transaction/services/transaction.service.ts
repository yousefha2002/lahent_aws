import {Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from 'src/common/enums/transaction_type';
import { Order } from '../../order/entities/order.entity';
import { Gift } from '../../gift/entities/gift.entity';
import { LoyaltyOffer } from '../../loyalty_offer/entites/loyalty_offer.entity';
import { Store } from '../../store/entities/store.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Avatar } from '../../avatar/entities/avatar.entity';
import { Op } from 'sequelize';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(repositories.transaction_repository) private transactionRepo: typeof Transaction
  ) {}

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
      where.type ={ [Op.in]: [TransactionType.REFUND_WALLET,TransactionType.GIFT_REFUNDED] };
    } else if (typeFilter === 'gift') {
      where.type = { [Op.in]: [TransactionType.GIFT_SENT, TransactionType.GIFT_RECEIVED,TransactionType.GIFT_REFUNDED] };
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