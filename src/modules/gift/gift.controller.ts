import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @ApiOperation({ summary: 'Send a gift (customer only)' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receiverPhone: { type: 'string', example: '970593411165' },
        receiverName: { type: 'string', example: 'Ali' },
        giftTemplateId: { type: 'number', example: 1 },
        amount: { type: 'number', example: 100 },
      },
      required: ['receiverPhone', 'giftTemplateId', 'amount'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gift sent successfully',
    schema: {
      example: { message: 'Sent successfully' },
    },
  })
  @Post('create')
  @UseGuards(CustomerGuard, CompletedProfileGuard)
  sendGift(
    @Body() body: CreateGiftDto,
    @CurrentUser() sender: Customer,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.giftService.createGift(sender.id, body, lang);
  }
}