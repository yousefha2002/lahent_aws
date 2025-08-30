import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
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
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiBody({ type: CreateOfferDto })
  async createOffer(@CurrentUser() store: Store, @Body() dto: CreateOfferDto,@Query('lang') lang=Language.en) {
    return this.offerService.createOffer(dto, store.id,lang);
  }

  @UseGuards(AdminGuard)
  @Put('/active-status/:offerId')
  async changeOfferActiveStatus(
    @Param('offerId') offerId: string,
    @Body() body: ChangeOfferActiveDto,
    @Req() req
  ) {
    return this.offerService.changeOfferActiveStatus(+offerId, body,req.lang);
  }

  @Serilaize(PaginatedOfferResponseDto)
  @ApiOperation({ summary: 'Get all active offers with store details' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'storeId', required: false, type: Number, example: 5 })
  @ApiResponse({status: 200,description: 'Paginated list of active offers',type: PaginatedOfferResponseDto})
  @Get('active/all')
  getActiveOffersWithStoreDetails(@Query('page') page=1,@Query('limit') limit=1,@Req() req,@Query('storeId') storeId?: number)
  {
    return this.offerService.getActiveOffersWithStoreDetails(+page,+limit,req.lang,storeId)
  }

  @Serilaize(PaginatedOfferResponseDto)
  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Get('byStore/all')
  @ApiOperation({ summary: 'Get all offers for the current store' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'DISCOUNT_AMOUNT' })
  @ApiQuery({ name: 'storeId', required: false, type: Number, example: 5 })
  @ApiResponse({status: 200,description: 'Paginated list of offers for the store',type: PaginatedOfferResponseDto})
  getAllOffersForStore(@CurrentUser() store:Store,@Query('page') page=1,@Query('limit') limit=10,@Req() req,@Query('type') type?: string)
  {
    return this.offerService.getAllOffersForStore(store.id,+page,+limit,req.lang,type)
  }
}
