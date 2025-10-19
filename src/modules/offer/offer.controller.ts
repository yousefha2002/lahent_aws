import {Body,Controller,Get,Param,ParseIntPipe,Post,Put,Query} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ChangeOfferActiveDto } from './dto/change-offer-active.dto';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedOfferResponseDto } from './dto/offer-response.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { OfferType } from 'src/common/enums/offer_type';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.CreateOffer,ApprovedStoreGuard)
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
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateOfferDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context,actor} = user
    return this.offerService.createOffer(dto,actor, context.id, lang);
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateOffer)
  @Put('/active-status/:offerId')
  async changeOfferActiveStatus(
    @Param('offerId') offerId: string,
    @Body() body: ChangeOfferActiveDto,
    @I18n() i18n: I18nContext,
    @CurrentUser() user:CurrentUserType
  ) {
    const lang = getLang(i18n);
    const {actor} = user
    return this.offerService.changeOfferActiveStatus(+offerId,actor, body, lang);
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
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.ViewOffer)
  @Get('byStore/all')
  @ApiOperation({ summary: 'Get all offers for the current store' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, enum: OfferType,example: OfferType.FIXED})
  @ApiQuery({ name: 'typeId', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Paginated list of offers for the store', type: PaginatedOfferResponseDto })
  getAllOffersForStore(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @I18n() i18n: I18nContext,
    @Query('type') type?: string,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.offerService.getAllOffersForStore(context.id, +page, +limit, lang, type);
  }
}
