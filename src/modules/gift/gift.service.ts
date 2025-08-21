import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
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
  ) {}

  async createGift(
    senderId: number,
    dto: CreateGiftDto,
    lang: Language = Language.en,
  ) {
    const { receiverPhone, receiverName, giftTemplateId, amount } = dto;

    const [giftTemplate, sender] = await Promise.all([
      this.giftTemplateService.findById(giftTemplateId),
      this.customerService.findById(senderId),
    ]);

    if (sender.walletBalance < amount) {
      const message = this.i18n.translate('translation.not_enough_balance', {
        lang,
      });
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
      // Receiver exists in system
      receiver.walletBalance += amount;
      await receiver.save();

      finalReceiverId = receiver.id;
      finalReceiverName = receiver.name;
      finalReceiverPhone = receiver.phone;
      finalStatus = GiftStatus.RECEVIED;
    } else {
      // Receiver not in system → pending gift
      if (!receiverName) {
        const message = this.i18n.translate('translation.receiver_required', {
          lang,
        });
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
    });

    // Deduct from sender wallet
    sender.walletBalance -= amount;
    await sender.save();

    // Create transaction for sender
    await this.transactionService.createTransaction({
      customerId: senderId,
      amount,
      direction: 'OUT',
      type: TransactionType.GIFT_SENT,
      giftId: gift.id,
    });

    // If receiver exists, create transaction for receiver
    if (receiver) {
      await this.transactionService.createTransaction({
        customerId: receiver.id,
        amount,
        direction: 'IN',
        type: TransactionType.GIFT_RECEIVED,
        giftId: gift.id,
      });
    }

    const successMessage = this.i18n.translate('translation.gift_sent', {
      lang,
    });
    return { message: successMessage };
  }

  async updateGiftsForNewCustomer(
    phone: string,
    customerId: number,
    lang: Language = Language.en,
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
}
