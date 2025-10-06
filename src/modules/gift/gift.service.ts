import { SmsService } from './../sms/sms.service';
import { FcmTokenService } from 'src/modules/fcm_token/fcm_token.service';
import {BadRequestException,forwardRef,Inject,Injectable} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Gift } from './entities/gift.entity';
import { GiftTemplateService } from '../gift_template/gift_template.service';
import { GiftStatus } from 'src/common/enums/gift_status';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CustomerService } from '../customer/customer.service';
import { formatPhoneNumber } from 'src/common/utils/formatPhoneNumber';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from 'src/common/enums/transaction_type';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { Op, Sequelize } from 'sequelize';
import { Customer } from '../customer/entities/customer.entity';
import { Avatar } from '../avatar/entities/avatar.entity';
import { GiftTemplate } from '../gift_template/entities/gift_template.entity';
import { GiftNotifications } from 'src/common/constants/notification/gift-notification';
import { RoleStatus } from 'src/common/enums/role_status';

@Injectable()
export class GiftService {
  constructor(
    @Inject(repositories.gift_repository)
    private giftRepo: typeof Gift,
    private readonly giftTemplateService: GiftTemplateService,
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
    private readonly i18n: I18nService,
    private readonly fcmTokenService:FcmTokenService,
    private readonly smsService:SmsService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {}

  async createGift(senderId: number, dto: CreateGiftDto, lang: Language = Language.ar) {
    const transaction = await this.sequelize.transaction();
    try {
      const { receiverPhone, receiverName, giftTemplateId, amount } = dto;

      const [giftTemplate, sender] = await Promise.all([
        this.giftTemplateService.findById(giftTemplateId),
        this.customerService.findById(senderId),
      ]);

      if (sender.walletBalance < amount) {
        const message = this.i18n.translate('translation.not_enough_balance', { lang });
        throw new BadRequestException(message);
      }

      let finalReceiverId: number | null = null;
      let finalReceiverName: string;
      let finalReceiverPhone: string;
      let finalStatus: GiftStatus;

      // Find receiver by phone
      const receiver = await this.customerService.findByPhone(
        formatPhoneNumber(receiverPhone),
      );

      if (receiver) {
        receiver.walletBalance += amount;
        await receiver.save({ transaction });

        finalReceiverId = receiver.id;
        finalReceiverName = receiver.name;
        finalReceiverPhone = receiver.phone;
        finalStatus = GiftStatus.RECEVIED;
      } else {
        if (!receiverName) {
          const message = this.i18n.translate('translation.receiver_required', { lang });
          throw new BadRequestException(message);
        }

        finalReceiverId = null;
        finalReceiverName = receiverName;
        finalReceiverPhone = formatPhoneNumber(receiverPhone);
        finalStatus = GiftStatus.PENDING;
      }

      // Create the gift
      const gift = await this.giftRepo.create({
        senderId: sender.id,
        receiverId: finalReceiverId,
        receiverName: finalReceiverName,
        receiverPhone: finalReceiverPhone,
        giftTemplateId: giftTemplate.id,
        amount,
        status: finalStatus,
      }, { transaction });

      // Deduct from sender wallet
      sender.walletBalance -= amount;
      await sender.save({ transaction });

      // Create transaction for sender
      await this.transactionService.createTransaction({
        customerId: senderId,
        amount,
        direction: 'OUT',
        type: TransactionType.GIFT_SENT,
        giftId: gift.id,
      }, transaction);

      // If receiver exists, create transaction for receiver
      if (receiver) {
        await this.transactionService.createTransaction({
          customerId: receiver.id,
          amount,
          direction: 'IN',
          type: TransactionType.GIFT_RECEIVED,
          giftId: gift.id,
        }, transaction);
      }

      await transaction.commit();

      const smsMessage = this.i18n.translate('translation.sms.gift_received', {lang,args: { amount }});
      await this.smsService.sendSms(finalReceiverPhone, smsMessage);

      if (receiver) {
        await this.fcmTokenService.notifyUser(
          receiver.id,
          RoleStatus.CUSTOMER,
          GiftNotifications.GIFT_RECEIVED.title[lang],
        );
      }

      const successMessage = this.i18n.translate('translation.gift_sent', { lang });
      return { message: successMessage };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateGiftsForNewCustomer(
    phone: string,
    customerId: number,
  ) {
    const gifts = await this.giftRepo.findAll({
      where: { receiverPhone: phone, status: GiftStatus.PENDING },
    });

    let totalAmount = 0;

    if (gifts.length === 0) return totalAmount;

    for (const gift of gifts) {
      gift.receiverId = customerId;
      gift.status = GiftStatus.RECEVIED;
      await gift.save();

      await this.transactionService.createTransaction({
        customerId,
        amount: gift.amount,
        direction: 'IN',
        type: TransactionType.GIFT_RECEIVED,
        giftId: gift.id,
      });

      totalAmount += gift.amount;
    }

    return totalAmount;
  }

  async getGiftsByCustomer(customerId: number, page = 1, limit = 10){
    const offset = (page - 1) * limit;

    const { rows, count } = await this.giftRepo.findAndCountAll({
      where: {
        [Op.or]: [{ senderId: customerId }, { receiverId: customerId }],
      },
      include: [
        { model: Customer, as: 'sender', include: [Avatar] },
        { model: Customer, as: 'receiver', include: [Avatar] },
        { model: GiftTemplate },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const data = rows.map((gift) => {
      const plainGift = gift.toJSON();

      const isSender = plainGift.senderId === customerId;
      const otherParty = isSender ? plainGift.receiver : plainGift.sender;

      const giftDto = {
        id: plainGift.id,
        amount: plainGift.amount,
        giftTemplate: plainGift.giftTemplate,
        otherParty: otherParty
          ? { name: otherParty.name, phone: otherParty.phone }
          : {
              name: isSender ? plainGift.receiverName : plainGift.senderName,
              phone: isSender ? plainGift.receiverPhone : plainGift.senderPhone,
            },
        createdAt: plainGift.createdAt,
        direction: isSender ? 'SENT' : 'RECEIVED', // هاد الحقل يوضح إذا أرسل أو استلم
      };

      return giftDto;
    });

    return {
      data,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}