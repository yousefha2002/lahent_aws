import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ChangeOfferActiveDto } from './dto/change-offer-active.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedOfferResponseDto } from './dto/offer-response.dto';
import { Language } from 'src/common/enums/language';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Post()
  async createOffer(@CurrentUser() store: Store, @Body() dto: CreateOfferDto,@Query('lang') lang=Language.en) {
    return this.offerService.createOffer(dto, store.id,lang);
  }

  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Put('/active-status/:offerId')
  async changeOfferActiveStatus(
    @CurrentUser() store: Store,
    @Param('offerId') offerId: string,
    @Body() body: ChangeOfferActiveDto,
    @Query('lang') lang=Language.en
  ) {
    return this.offerService.changeOfferActiveStatus(+offerId, body, store.id,lang);
  }

  @Serilaize(PaginatedOfferResponseDto)
  @Get('active/all')
  getActiveOffersWithStoreDetails(@Query('page') page=1,@Query('limit') limit=1,@Query('storeId') storeId?: number)
  {
    return this.offerService.getActiveOffersWithStoreDetails(+page,+limit,storeId)
  }

  @Serilaize(PaginatedOfferResponseDto)
  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Get('byStore/all')
  getAllOffersForStore(@CurrentUser() store:Store,@Query('page') page=1,@Query('limit') limit=10,@Query('type') type?: string)
  {
    return this.offerService.getAllOffersForStore(store.id,+page,+limit,type)
  }
}
