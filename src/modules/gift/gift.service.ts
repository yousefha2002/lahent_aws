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
import { TransactionService } from '../transaction/services/transaction.service';
import { TransactionType } from 'src/common/enums/transaction_type';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { Op, Sequelize } from 'sequelize';
import { Customer } from '../customer/entities/customer.entity';
import { Avatar } from '../avatar/entities/avatar.entity';
import { GiftTemplate } from '../gift_template/entities/gift_template.entity';
import { GiftNotifications } from 'src/common/constants/notification/gift-notification';
import { RoleStatus } from 'src/common/enums/role_status';
import { SMSMessages } from 'src/common/constants/notification/sms-messages';

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

  async createGift(sender: Customer, dto: CreateGiftDto, lang: Language) {
    const transaction = await this.sequelize.transaction();
    try {
      const { receiverPhone, receiverName, giftTemplateId, amount } = dto;
      const giftTemplate = await this.giftTemplateService.findById(giftTemplateId)

      if (sender.walletBalance < amount) {
        const message = this.i18n.translate('translation.not_enough_balance', { lang });
        throw new BadRequestException(message);
      }

      let finalReceiverId: number | null = null;
      let finalReceiverName: string;
      let finalReceiverPhone: string;

      // Find receiver by phone
      const receiver = await this.customerService.findByPhone(
        formatPhoneNumber(receiverPhone),
      );

      if (receiver) {
        finalReceiverId = receiver.id;
        finalReceiverName = receiver.name;
        finalReceiverPhone = receiver.phone;
      } else {
        if (!receiverName) {
          const message = this.i18n.translate('translation.receiver_required', { lang });
          throw new BadRequestException(message);
        }

        finalReceiverId = null;
        finalReceiverName = receiverName;
        finalReceiverPhone = formatPhoneNumber(receiverPhone);
      }

      // Create the gift
      const gift = await this.giftRepo.create({
        senderId: sender.id,
        receiverId: finalReceiverId,
        receiverName: finalReceiverName,
        receiverPhone: finalReceiverPhone,
        giftTemplateId: giftTemplate.id,
        amount,
      }, { transaction });

      // Deduct from sender wallet
      sender.walletBalance -= amount;
      await sender.save({ transaction });

      // Create transaction for sender
      await this.transactionService.createTransaction({
        customerId: sender.id,
        amount,
        direction: 'OUT',
        type: TransactionType.GIFT_SENT,
        giftId: gift.id,
      }, transaction);

      await transaction.commit();

      const smsMessage = SMSMessages.GIFT_RECEIVED(sender.phone, amount)[lang];
      // await this.smsService.sendSms(finalReceiverPhone, smsMessage);

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

  async getGiftsByCustomer(customerId: number, page = 1, limit = 10){
    const offset = (page - 1) * limit;

    const { rows, count } = await this.giftRepo.findAndCountAll({
      where: { receiverId: customerId ,status:GiftStatus.PENDING}, 
      include: [
        { model: Customer, as: 'sender', include: [Avatar] },
        { model: GiftTemplate },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data:rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  async respondToGift(giftId: number, customer: Customer, accept: boolean, lang: Language) 
  {
      const transaction = await this.sequelize.transaction();
      try {
        const gift = await this.giftRepo.findOne({where:{id:giftId,receiverPhone:customer.phone}});
        if (!gift) {
          throw new BadRequestException(this.i18n.translate('translation.gift_not_found', { lang }));
        }

        if (gift.status !== GiftStatus.PENDING) {
          throw new BadRequestException(this.i18n.translate('translation.gift_already_handled', { lang }));
        }

        // إذا الهدية كانت بدون receiverId، نضيفه الآن
        if (!gift.receiverId) {
          gift.receiverId = customer.id;
          await gift.save({ transaction });
        }

        if (accept) {
          gift.status = GiftStatus.RECEIVED;

          // إضافة الرصيد للمستلم
          customer.walletBalance += gift.amount;
          await customer.save({ transaction });

          // إنشاء transaction للمستلم
          await this.transactionService.createTransaction({
            customerId: customer.id,
            amount: gift.amount,
            direction: 'IN',
            type: TransactionType.GIFT_RECEIVED,
            giftId: gift.id,
          }, transaction);

        } else {
          gift.status = GiftStatus.REJECTED;

          // إعادة المبلغ للمرسل
          const sender = await this.customerService.findById(gift.senderId);
          sender.walletBalance += gift.amount;
          await sender.save({ transaction });

          // إنشاء transaction للمرسل
          await this.transactionService.createTransaction({
            customerId: sender.id,
            amount: gift.amount,
            direction: 'IN',
            type: TransactionType.GIFT_REFUNDED,
            giftId: gift.id,
          }, transaction);
        }

        await gift.save({ transaction });
        await transaction.commit();

        return { message: accept 
          ? this.i18n.translate('translation.gift_accepted', { lang }) 
          : this.i18n.translate('translation.gift_rejected', { lang }) 
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
  }
}