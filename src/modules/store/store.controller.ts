import { StoreGeolocationService } from './services/storeGeolocation.service';
import { StoreAuthService } from './services/storeAuth.service';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreService } from './services/store.service';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { multerOptions } from 'src/multer/multer.options';
import {
  OpeningHourEnum,
  validateAndParseOpeningHours,
} from 'src/common/validation/validateAndParseOpeningHours';
import { LoginStoreDto } from './dto/store-login.dto';
import { GetNearbyStoresDto } from './dto/get-nearby-store.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { Customer } from '../customer/entities/customer.entity';
import { StoreStatus } from 'src/common/enums/store_status';
import { AdminGuard } from 'src/common/guards/admin.guard'; // تأكد أنك مستورد هذا
import { Language } from 'src/common/enums/language';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from './entities/store.entity';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { StoreDetailsDto } from './dto/store-details.dto';
import { Owner } from '../owner/entities/owner.entity';
import { PaginatedStoreDto, StoreDto } from './dto/Store.dto';
import { StoreWithTokenDto } from './dto/simple-store.dto';

@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly storeAuthService: StoreAuthService,
    private readonly storeGeolocationService: StoreGeolocationService,
  ) {}

  @Post('create')
  @UseGuards(OwnerGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  async create(
    @Body() body: CreateStoreDto,
    @CurrentUser() user: any,
    @Query('lang') lang=Language.en,
    @UploadedFiles()    
    files: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const logoImage = files.logo?.[0];
    const coverImage = files.cover?.[0];

    if (!logoImage || !coverImage) {
      throw new BadRequestException('Both logo and cover images are required');
    }

    const openingHours2 = validateAndParseOpeningHours(body.openingHours);

    return this.storeAuthService.create(
      body,
      user.id,
      openingHours2 as OpeningHourEnum[],
      logoImage,
      coverImage,
      lang
    );
  }

  @Serilaize(StoreWithTokenDto)
  @Post('login')
  login(@Body() body: LoginStoreDto,@Query('lang') lang=Language.en) {
    return this.storeAuthService.login(body,lang);
  }

  @Serilaize(StoreDetailsDto)
  @UseGuards(StoreOrOwnerGuard)
  @Get('details')
  getStoreDetails(@CurrentUser() store: Store) {
    return this.storeService.getStoreDetails(store.id);
  }

  @Serilaize(StoreDto)
  @Get('byOwner')
  @UseGuards(OwnerGuard)
  findStoresByOwner(@CurrentUser() owner: Owner,@Query('lang') lang=Language.en) {
    return this.storeService.findStoresByOwner(owner.id,lang);
  }

  @Serilaize(StoreDto)
  @UseGuards(CustomerGuard)
  @Post('nearby')
  async getNearbyStores(
    @Body() dto: GetNearbyStoresDto,
    @CurrentUser() customer: Customer,
    @Query('lang') lang = Language.en,
    @Query('type') type: number,
    @Query('subType') subType: number,
  ) {
    return this.storeGeolocationService.findStoresNearbyOrBetween(
      dto,
      customer.id,
      lang,
      type,
      subType,
    );
  }

  @Serilaize(PaginatedStoreDto)
  @Get('all')
  getAllStores(
    @Query('type') type: number,
    @Query('subType') subType: number,
    @Query('page') page = 1,
    @Query('lang') lang = Language.en,
    @Query('lang') name: string,
    @Query('limit') limit = 10,
  ) {
    return this.storeService.findAllStores(
      lang,
      page,
      limit,
      type,
      subType,
      name,
    );
  }

  @Serilaize(StoreDto)
  @Get(':id')
  async getFullDetailsStore(
    @Param('id') storeId: number,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.storeService.getFullDetailsStore(storeId, lang);
  }

  @Put('/:storeId/approved')
  @UseGuards(AdminGuard)
  acceptStore(@Param('storeId') storeId: string,@Query('lang') lang=Language.en) {
    return this.storeService.changeStoreStatus(StoreStatus.APPROVED, +storeId,lang);
  }

  @Put('/:storeId/rejected')
  @UseGuards(AdminGuard)
  rejectStore(@Param('storeId') storeId: string,@Query('lang') lang=Language.en) {
    return this.storeService.changeStoreStatus(StoreStatus.REJECTED, +storeId,lang);
  }

  @UseGuards(StoreOrOwnerGuard)
  @Put()
  updateStore(@CurrentUser() store: Store, @Body() dto: UpdateStoreDto,@Query('lang') lang=Language.en) {
    return this.storeService.updateStore(store, dto,lang);
  }

  @UseGuards(StoreOrOwnerGuard)
  @Put('update-images')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  updateImages(
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const logo = files.logo?.[0];
    const cover = files.cover?.[0];
    return this.storeService.updateStoreImages(store, logo, cover,lang);
  }

  @Serilaize(PaginatedStoreDto)
  @UseGuards(CustomerGuard)
  @Get('favourite/byCustomer')
  getFavouriteStoresByCustomer(@CurrentUser() user: Customer,@Query('lang') lang=Language.en,@Query('page') page = 1,@Query('limit') limit = 10) {
    return this.storeService.getFavouriteStoresByCustomer(user.id,lang,page,limit);
  }
}