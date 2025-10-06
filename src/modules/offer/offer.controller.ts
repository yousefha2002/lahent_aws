import {Body,Controller,Get,Param,ParseIntPipe,Post,Put,Query,UseGuards} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ChangeOfferActiveDto } from './dto/change-offer-active.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approved-store.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedOfferResponseDto } from './dto/offer-response.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { OfferType } from 'src/common/enums/offer_type';
import { StoreGuard } from 'src/common/guards/store.guard';
import { StoreOrAdminGuard } from 'src/common/guards/store-or-admin-guard';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  @Post()
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'Offer created successfully',
      },
    },
  })
  @ApiOperation({ summary: 'Create a new offer for the store' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiBody({ type: CreateOfferDto })
  async createOffer(
    @CurrentUser() store: Store,
    @Body() dto: CreateOfferDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.offerService.createOffer(dto, store.id, lang);
  }

  @UseGuards(AdminGuard)
  @Put('/active-status/:offerId')
  async changeOfferActiveStatus(
    @Param('offerId') offerId: string,
    @Body() body: ChangeOfferActiveDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.offerService.changeOfferActiveStatus(+offerId, body, lang);
  }

  @Serilaize(PaginatedOfferResponseDto)
  @ApiOperation({ summary: 'Get all active offers with store details' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'storeId', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'typeId', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Paginated list of active offers', type: PaginatedOfferResponseDto })
  @Get('active/all')
  getActiveOffersWithStoreDetails(
    @Query('page') page = 1,
    @Query('limit') limit = 1,
    @I18n() i18n: I18nContext,
    @Query('storeId') storeId?: number,
    @Query('typeId', new ParseIntPipe({ optional: true })) typeId?: number,
  ) {
    const lang = getLang(i18n);
    return this.offerService.getActiveOffersWithStoreDetails(+page, +limit, lang, storeId,typeId);
  }

  @Serilaize(PaginatedOfferResponseDto)
  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  @Get('byStore/all')
  @ApiOperation({ summary: 'Get all offers for the current store' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, enum: OfferType,example: OfferType.FIXED})
  @ApiQuery({ name: 'typeId', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Paginated list of offers for the store', type: PaginatedOfferResponseDto })
  getAllOffersForStore(
    @CurrentUser() store: Store,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @I18n() i18n: I18nContext,
    @Query('type') type?: string,
  ) {
    const lang = getLang(i18n);
    return this.offerService.getAllOffersForStore(store.id, +page, +limit, lang, type);
  }
}
