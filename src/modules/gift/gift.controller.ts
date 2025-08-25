import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @ApiOperation({ summary: 'Send a gift (customer only)' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receiverPhone: { type: 'string', example: '970593411165s' },
        receiverName: { type: 'string', example: 'ali' },
        giftTemplateId: { type: 'number', example: 1 },
        amount: { type: 'number', example: 100 },
      },
      required: ['receiverPhone', 'giftTemplateId', 'amount'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gift  sended successfully',
    schema: {
      example: {
        message: 'Sended successfully',
      },
    },
  })
  @Post('create')
  @UseGuards(CustomerGuard, CompletedProfileGuard)
  CreateGiftDto(
    @Body() body: CreateGiftDto,
    @CurrentUser() sender: Customer,
    @Query('lang') lang = Language.en,
  ) {
    return this.giftService.createGift(sender.id, body, lang);
  }
}
