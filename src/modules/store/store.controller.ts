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
import { FullDetailsStoreDto } from './dto/full-details-store.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly storeAuthService: StoreAuthService,
    private readonly storeGeolocationService: StoreGeolocationService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new store (Owner only)' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '0501234567' },
        phoneLogin: { type: 'string', example: '0501234567' },
        city: { type: 'string', example: 'الرياض' },
        commercialRegister: { type: 'string', example: '1234567890' },
        taxNumber: { type: 'string', example: '1234567890' },
        password: { type: 'string', example: '123456' },
        subTypeId: { type: 'string', example: '1' },
        lat: { type: 'string', example: '24.7136' },
        lng: { type: 'string', example: '46.6753' },
        in_store: { type: 'boolean', example: true },
        drive_thru: { type: 'boolean', example: false },
        openingHours: {
          type: 'string',
          example: JSON.stringify([
          { day: 'mon', openTime: '08:00', closeTime: '18:00' },
          { day: 'tue', openTime: '08:00', closeTime: '18:00' },
          { day: 'wed', openTime: '08:00', closeTime: '18:00' },
          { day: 'thu', openTime: '08:00', closeTime: '18:00' },
          { day: 'fri', openTime: '08:00', closeTime: '18:00' },
          { day: 'sat', openTime: '08:00', closeTime: '18:00' },
          { day: 'sun', openTime: '08:00', closeTime: '18:00' },
        ]),
        },
        translations: {
          type: 'string',
          example: JSON.stringify([
            { languageCode: 'en', name: 'My Store' },
            { languageCode: 'ar', name: 'متجري'},
          ]),
        },
        logo: { type: 'string', format: 'binary' },
        cover: { type: 'string', format: 'binary' },
      },
      required: [
        'phone', 'phoneLogin', 'city', 'commercialRegister', 'taxNumber',
        'password', 'subTypeId', 'lat', 'lng', 'in_store', 'drive_thru',
        'openingHours', 'translations', 'logo', 'cover'
      ],
    },
  })
  @ApiResponse({status: 200,description: 'Store created successfully',schema: { example: { message: 'Created successfully' } },})
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
  async create(@Body() body: CreateStoreDto,@CurrentUser() user: any,@Query('lang') lang=Language.en,@UploadedFiles()    
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
  @ApiOperation({ summary: 'Login store and return access & refresh tokens' })
  @ApiBody({ type: LoginStoreDto })
  @ApiResponse({status: 200,description: 'Store login successful',type: StoreWithTokenDto})
  login(@Body() body: LoginStoreDto,@Query('lang') lang=Language.en) {
    return this.storeAuthService.login(body,lang);
  }

  @Get('details')
  @ApiOperation({ summary: 'Get store details for update action' })
  @ApiResponse({status: 200,description: 'Store login successful',type: StoreDetailsDto})
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiSecurity('access-token')
  @Serilaize(StoreDetailsDto)
  @UseGuards(StoreOrOwnerGuard)
  getStoreDetails(@CurrentUser() store: Store) {
    return this.storeService.getStoreDetails(store.id);
  }

  @Get('byOwner')
  @ApiOperation({ summary: 'Get all stores of the owner' })
  @ApiResponse({status: 200,description: 'Store login successful',type: [StoreDto]})
  @ApiSecurity('access-token')
  @Serilaize(StoreDto)
  @UseGuards(OwnerGuard)
  findStoresByOwner(@CurrentUser() owner: Owner,@Query('lang') lang=Language.en) {
    return this.storeService.findStoresByOwner(owner.id,lang);
  }

  @Post('nearby')
  @Serilaize(PaginatedStoreDto)
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Get nearby stores based on customer location' })
  @ApiQuery({ name: 'type', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'subType', type: Number, required: false, example: 2 })
  @ApiSecurity('access-token')
  @ApiResponse({status: 200,type: [PaginatedStoreDto]})
  @ApiBody({ type: GetNearbyStoresDto })
  async getNearbyStores(
    @Body() dto: GetNearbyStoresDto,
    @CurrentUser() customer: Customer,
    @Query('lang') lang = Language.ar,
    @Query('type') type: number,
    @Query('subType') subType: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    return this.storeGeolocationService.findStoresNearbyOrBetween(
      dto,
      customer.id,
      lang,
      +page,
      +limit,
      type,
      subType,
    );
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all stores with optional filters' })
  @ApiQuery({ name: 'type', required: false, type: Number, description: 'Filter by store type ID' })
  @ApiQuery({ name: 'subType', required: false, type: Number, description: 'Filter by store sub-type ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number, default is 1' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page, default is 10' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by store name' })
  @ApiResponse({status: 200,description: 'Paginated list of stores',type: PaginatedStoreDto,})
  @Serilaize(PaginatedStoreDto)
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

  @UseGuards(CustomerGuard)
  @Serilaize(FullDetailsStoreDto)
  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a store by ID (customer only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the store', example: 1 })
  @ApiResponse({status: 200,description: 'full details of store',type: FullDetailsStoreDto,})
  async getFullDetailsStore(
    @Param('id') storeId: number,
    @Query('lang') lang: Language = Language.en,
    @CurrentUser() customer:Customer
  ) {
    return this.storeService.getFullDetailsStore(storeId,customer.id, lang);
  }

  @Put('/:storeId/approved')
  @ApiOperation({ summary: 'Approve a store (Admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to approve', example: 5 })
  @UseGuards(AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Store approved successfully',
    schema: {
      example: {
        message: 'Store status updated to APPROVED',
        storeId: 5,
      },
    },
  })
  acceptStore(@Param('storeId') storeId: string,@Query('lang') lang=Language.en) {
    return this.storeService.changeStoreStatus(StoreStatus.APPROVED, +storeId,lang);
  }

  @Put('/:storeId/rejected')
  @ApiOperation({ summary: 'Reject a store (Admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to reject', example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Store rejected successfully',
    schema: {
      example: {
        message: 'Store status updated to REJECTED',
        storeId: 5,
      },
    },
  })
  @UseGuards(AdminGuard)
  rejectStore(@Param('storeId') storeId: string,@Query('lang') lang=Language.en) {
    return this.storeService.changeStoreStatus(StoreStatus.REJECTED, +storeId,lang);
  }

  @Put()
  @ApiOperation({ summary: 'Update store details (Store or Owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({
    status: 200,
    description: 'Store updated successfully',
    schema: { example: { message: 'Store updated successfully' } },
  })
  @UseGuards(StoreOrOwnerGuard)

  updateStore(@CurrentUser() store: Store, @Body() dto: UpdateStoreDto,@Query('lang') lang=Language.en) {
    return this.storeService.updateStore(store, dto,lang);
  }

  @Put('update-images')
  @UseGuards(StoreOrOwnerGuard)
  @ApiOperation({ summary: 'Update store images (logo / cover)' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Store images updated successfully',
    schema: {
      example: {
        message: 'Images updated successfully',
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/logo.png',
        coverUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/cover.png',
      },
    },
  })
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

  @Get('favourite/byCustomer')
  @ApiOperation({ summary: 'Get favourite stores for the current customer' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({status: 200,description: 'List of favourite stores with pagination',type: PaginatedStoreDto})
  @Serilaize(PaginatedStoreDto)
  @UseGuards(CustomerGuard)
  getFavouriteStoresByCustomer(@CurrentUser() user: Customer,@Query('lang') lang=Language.en,@Query('page') page = 1,@Query('limit') limit = 10) {
    return this.storeService.getFavouriteStoresByCustomer(user.id,lang,page,limit);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns new access & refresh tokens',
    schema: {
      example: {
        accessToken: 'newAccessTokenHere',
      },
    },
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.storeAuthService.refreshToken(refreshToken)
  }
}