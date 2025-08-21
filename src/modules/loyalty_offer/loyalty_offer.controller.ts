import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LoyaltyOfferService } from './loyalty_offer.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UpdateLoyaltyOfferDto } from './dto/update-loyalty-offer.dto';
import { CreateLoyaltyOfferDto } from './dto/create-loyalty-offer.dto';
import { BaseloyaltyOfferDto, ExtendedLoyaltyOfferDto } from './dto/loyalty-offer.dt';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { Language } from 'src/common/enums/language';

@Controller('loyalty-offer')
export class LoyaltyOfferController {
  constructor(private readonly loyaltyOfferService: LoyaltyOfferService) {}

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() dto: CreateLoyaltyOfferDto,@Query('lang') lang=Language.en) {
    return this.loyaltyOfferService.create(dto,lang);
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Get('admin')
  async getAllAdmin() {
    return this.loyaltyOfferService.findAllForAdmin();
  }

  @Serilaize(BaseloyaltyOfferDto)
  @Get('active')
  async getActiveForCustomer() {
    return this.loyaltyOfferService.findActiveForCustomer();
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateLoyaltyOfferDto,@Query('lang') lang=Language.en) {
    return this.loyaltyOfferService.update(+id, dto,lang);
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Patch(':id/toggle')
  async toggleStatus(@Param('id') id: number,@Query('lang') lang=Language.en) {
    return this.loyaltyOfferService.toggleStatus(+id,lang);
  }
}