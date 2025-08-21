import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Post('create')
  @UseGuards(CustomerGuard,CompletedProfileGuard)
  CreateGiftDto(@Body() body: CreateGiftDto, @CurrentUser() sender: Customer,@Query('lang') lang=Language.en) {
    return this.giftService.createGift(sender.id, body,lang);
  }
}