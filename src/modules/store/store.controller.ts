import { FcmTokenService } from 'src/modules/fcm_token/fcm_token.service';
import { UserTokenService } from './../user_token/user_token.service';
import { StoreGeolocationService } from './services/storeGeolocation.service';
import { StoreAuthService } from './services/storeAuth.service';
import {Controller,Post,Body,UseGuards,UseInterceptors,UploadedFiles,Get,Query,Put,Param,ParseIntPipe,Req,Ip,} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateStoreDto } from './dto/requests/create-store.dto';
import { StoreService } from './services/store.service';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { multerOptions } from 'src/multer/multer.options';
import {OpeningHourEnum,validateAndParseOpeningHours,} from 'src/common/validators/validateAndParseOpeningHours';
import { LoginStoreDto } from './dto/requests/store-login.dto';
import { GetNearbyStoresDto } from './dto/requests/get-nearby-store.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { Customer } from '../customer/entities/customer.entity';
import { StoreStatus } from 'src/common/enums/store_status';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from './entities/store.entity';
import { UpdateStoreDto } from './dto/requests/update-store.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { Owner } from '../owner/entities/owner.entity';
import { storeForAction } from './dto/responses/store-for-action.dto';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { StoreOptionsDto } from './dto/responses/store-options.dto';
import { CurrentStoreDTO } from './dto/responses/current-store.dto';
import { InitialCreateStoreDto } from './dto/requests/initial-create-store.dto';
import { OwnerStoresResponseDto } from './dto/responses/owner-store-response.dto';
import { IncompleteStoreResponseDto } from './dto/responses/in-completed-store-response.dto';
import { UpdatePasswordDto } from './dto/requests/update-password.dto';
import { SelectOwnerForStoreDto } from './dto/requests/selectStoreForOwner.dto';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { StoreGuard } from 'src/common/guards/store.guard';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { RoleStatus } from 'src/common/enums/role_status';
import { FullDetailsCustomerStoreViewDto, PaginatedCustomerStoreViewDto, StoreCustomerViewDto } from './dto/responses/customer-store.dto';
import { StoreWithTokenDto } from './dto/responses/store-with-token.dto';

@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly storeAuthService: StoreAuthService,
    private readonly storeGeolocationService: StoreGeolocationService,
    private readonly userTokenService:UserTokenService,
    private readonly fcmTokenService:FcmTokenService
  ) {}

  @Post('initial-create')
  @ApiOperation({ summary: 'Initial create store (Owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: InitialCreateStoreDto })
  @ApiResponse({status: 200,schema: {example: {message: 'Store created successfully'}}})
  @UseGuards(OwnerGuard,CompletedProfileGuard)
  async initialCreate(@Body() dto: InitialCreateStoreDto,@CurrentUser() owner: Owner,@I18n() i18n: I18nContext,) 
  {
    const lang = getLang(i18n);
    return this.storeAuthService.initialCreation(owner.id, dto, lang);
  }

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
            { languageCode: 'en', name: 'My Store'},
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
  async create(@Body() body: CreateStoreDto,@CurrentUser() user: any,@I18n() i18n: I18nContext,@UploadedFiles()    
    files: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const logo = files.logo?.[0];
    const cover = files.cover?.[0]
    const openingHours = validateAndParseOpeningHours(body.openingHours);
    const lang = getLang(i18n);

    return this.storeAuthService.create(body,user.id,openingHours as OpeningHourEnum[],lang,logo,cover);
  }

  @Serilaize(StoreWithTokenDto)
  @Post('login')
  @ApiOperation({ summary: 'Login store and return access & refresh tokens' })
  @ApiBody({ type: LoginStoreDto })
  @ApiResponse({status: 200,description: 'Store login successful',type: StoreWithTokenDto})
  login(@Body() body: LoginStoreDto,@I18n() i18n: I18nContext,@Req() req: Request,@Ip() ip:string) {
    const lang = getLang(i18n);
    const device = req.headers['user-agent'] || 'unknown';
    return this.storeAuthService.login(body,lang,device,ip);
  }

  @Serilaize(IncompleteStoreResponseDto)
  @Get('incomplete')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Get incomplete store info for owner' })
  @ApiSecurity('access-token')
  @ApiResponse({status: 200,description: 'Incomplete store info if exists',type: IncompleteStoreResponseDto})
  async getIncompleteStore(@CurrentUser() owner: Owner, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.storeService.getIncompleteStoreInfo(owner.id, lang);
  }

  @Serilaize(CurrentStoreDTO)
  @UseGuards(StoreGuard)
  @Get('current')
  @ApiOperation({ summary: 'Get Current Store With Basic details (owner or store only)' })
  @ApiSecurity('access-token')
  @ApiResponse({status: 200,type: CurrentStoreDTO})
  getCurrentStore(@CurrentUser() store:Store)
  {
    return this.storeService.getCurrentStore(store.id)
  }

  @UseGuards(StoreOrOwnerGuard)
  @Serilaize(storeForAction)
  @Get('action/current')
  @ApiOperation({ summary: 'Get full details of a store by ID for actions (owner or store only)' })
  @ApiResponse({status: 200,description: 'full details of store',type: storeForAction})
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiSecurity('access-token')
  async getStoreDetailsForAction(@CurrentUser() store:Store,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    return this.storeService.getStoreDetailsForAction(store.id,lang)
  }

  @Get('byOwner')
  @ApiOperation({ summary: 'Get all stores of the owner' })
  @ApiResponse({status: 200,type: [OwnerStoresResponseDto]})
  @ApiSecurity('access-token')
  @Serilaize(OwnerStoresResponseDto)
  @UseGuards(OwnerGuard)
  findStoresByOwner(@CurrentUser() owner: Owner,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.storeService.findStoresByOwner(owner.id,lang);
  }

  @Post('nearby')
  @Serilaize(PaginatedCustomerStoreViewDto)
  @ApiOperation({ summary: 'Get nearby stores based on  location' })
  @ApiQuery({ name: 'type', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'subType', type: Number, required: false, example: 2 })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 2 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 2 })
  @ApiResponse({status: 200,type: [PaginatedCustomerStoreViewDto]})
  @ApiBody({ type: GetNearbyStoresDto })
  async getNearbyStores(
    @Body() dto: GetNearbyStoresDto,
    @I18n() i18n: I18nContext,
    @Query('type', new ParseIntPipe({ optional: true })) type?: number,
    @Query('subType', new ParseIntPipe({ optional: true })) subType?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    const lang = getLang(i18n);
    return this.storeGeolocationService.findStoresNearbyOrBetween(
      dto,
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
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Latitude of user location' })
  @ApiQuery({ name: 'lng', required: false, type: Number, description: 'Longitude of user location' })
  @ApiResponse({status: 200,description: 'Paginated list of stores',type: PaginatedCustomerStoreViewDto})
  @Serilaize(PaginatedCustomerStoreViewDto)
  getAllStores(
    @I18n() i18n: I18nContext,
    @Query('name') name: string,
    @Query('type', new ParseIntPipe({ optional: true })) type?: number,
    @Query('subType', new ParseIntPipe({ optional: true })) subType?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number
  ) {
    const lang = getLang(i18n);
    return this.storeService.findAllStores(
      lang,
      page,
      limit,
      type,
      subType,
      name,
      lat,
      lng
    );
  }

  @UseGuards(CustomerGuard)
  @Serilaize(FullDetailsCustomerStoreViewDto)
  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a store by ID (customer only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the store', example: 1 })
  @ApiResponse({status: 200,description: 'full details of store',type: FullDetailsCustomerStoreViewDto})
  async getFullDetailsStore(
    @Param('id') storeId: number,
    @I18n() i18n: I18nContext,
    @CurrentUser() customer:Customer
  ) {
    const lang = getLang(i18n);
    return this.storeService.getFullDetailsStore(storeId, lang,customer.id);
  }

  @Serilaize(StoreCustomerViewDto)
  @Get('guest/:id')
  @ApiOperation({ summary: 'Get full details of a store by ID (guest)' })
  @ApiParam({ name: 'id', description: 'ID of the store', example: 1 })
  @ApiResponse({ status: 200, description: 'full details of store', type: StoreCustomerViewDto })
  async getFullDetailsStoreGuest(
    @Param('id') storeId: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.storeService.getFullDetailsStore(storeId, lang);
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
  acceptStore(@Param('storeId') storeId: string,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
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
  rejectStore(@Param('storeId') storeId: string,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
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
  updateStore(@CurrentUser() store: Store, @Body() dto: UpdateStoreDto,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
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
    @I18n() i18n: I18nContext,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const logo = files.logo?.[0];
    const cover = files.cover?.[0];
    const lang = getLang(i18n);
    return this.storeService.updateStoreImages(store, logo, cover,lang);
  }

  @Get('favourite/byCustomer')
  @ApiOperation({ summary: 'Get favourite stores for the current customer' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, type: Number, description: 'Filter by store type ID' })
  @ApiResponse({status: 200,description: 'List of favourite stores with pagination',type: PaginatedCustomerStoreViewDto})
  @Serilaize(PaginatedCustomerStoreViewDto)
  @UseGuards(CustomerGuard)
  getFavouriteStoresByCustomer(
    @CurrentUser() user: Customer,
    @I18n() i18n: I18nContext,
    @Query('type', new ParseIntPipe({ optional: true })) type?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10) 
    {
    const lang = getLang(i18n);
    return this.storeService.getFavouriteStoresByCustomer(user.id,lang,page,limit,type);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({type:RefreshTokenDto})
  @ApiResponse({
    status: 200,
    description: 'Returns new access & refresh tokens',
    schema: {
      example: {
        accessToken: 'newAccessTokenHere',
      },
    },
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.storeAuthService.refreshToken(dto)
  }

  @Post(':storeId/select/byOwner')
  @Serilaize(StoreWithTokenDto)
  @ApiOperation({ summary: 'Select a store for the current owner' })
  @ApiParam({ name: 'storeId', description: 'ID of the store to select', type: Number })
  @ApiResponse({ status: 200, description: 'Store selected successfully', type: StoreWithTokenDto })
  @ApiBody({ type: SelectOwnerForStoreDto })
  @UseGuards(OwnerGuard)
  selectStoreForOwner(@CurrentUser() owner:Owner,@Param('storeId') storeId:number,@Body() dto:SelectOwnerForStoreDto,@I18n() i18n: I18nContext,@Req() req: Request,@Ip() ip:string)
  {
    const lang = getLang(i18n)
    const device = req.headers['user-agent'] || 'unknown';
    return this.storeAuthService.selectStoreForOnwer(storeId,owner.id,dto,lang,device,ip)
  }

  @Serilaize(StoreOptionsDto)
  @Get(':id/withOpeningHours')
  @ApiOperation({ summary: 'Get store with opening hours and picked methods' })
  @ApiParam({ name: 'id', description: 'Store ID', example: 1 })
  @ApiOkResponse({ description: 'Store retrieved successfully', type: StoreOptionsDto })
  async getStoreWithOpeningHours(
    @Param('id') storeId: number,
  ) {
    return this.storeService.getStoreServiceOptions(storeId);
  }

  @Put('update-password')
  @UseGuards(StoreOrOwnerGuard)
  @ApiOperation({ summary: 'Update store password (Store or Owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: { example: { message: 'Password updated successfully' } },
  })
  async updatePassword(
    @CurrentUser() store: Store,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.storeAuthService.updatePassword(store, dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout store and invalidate refresh token' })
  @ApiBody({type:RefreshTokenDto})
  @ApiResponse({
    status: 200,
    description: 'Store logged out successfully',
    schema: { example: { message: 'Logged out successfully' } },
  })
  async logoutStore(@CurrentUser() store: Store,@Body() body:RefreshTokenDto) {
    await this.userTokenService.logout(body);
    await this.fcmTokenService.removeTokenByDevice(store.id,body.deviceId,RoleStatus.STORE);
  }
}