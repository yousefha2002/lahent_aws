import { FcmTokenService } from 'src/modules/fcm_token/fcm_token.service';
import { UserTokenService } from './../user_token/user_token.service';
import { StoreGeolocationService } from './services/storeGeolocation.service';
import { StoreAuthService } from './services/storeAuth.service';
import {Controller,Post,Body,UseInterceptors,UploadedFiles,Get,Query,Put,Param,ParseIntPipe} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateStoreDto } from './dto/requests/create-store.dto';
import { StoreService } from './services/store.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { multerOptions } from 'src/multer/multer.options';
import {OpeningHourEnum,validateAndParseOpeningHours,} from 'src/common/validators/validateAndParseOpeningHours';
import { LoginStoreDto } from './dto/requests/store-login.dto';
import { GetNearbyStoresDto } from './dto/requests/get-nearby-store.dto';
import { StoreStatus } from 'src/common/enums/store_status';
import { UpdateStoreDto } from './dto/requests/update-store.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { storeForAction } from './dto/responses/store-for-action.dto';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { StoreOptionsDto } from './dto/responses/store-options.dto';
import { CurrentStoreDTO } from './dto/responses/current-store.dto';
import { InitialCreateStoreDto } from './dto/requests/initial-create-store.dto';
import { OwnerStoresResponseDto } from './dto/responses/owner-store-response.dto';
import { IncompleteStoreResponseDto, PaginatedAdminIncompleteStoresDto } from './dto/responses/in-completed-store-response.dto';
import { UpdatePasswordDto } from './dto/requests/update-password.dto';
import { SelectOwnerForStoreDto } from './dto/requests/selectStoreForOwner.dto';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { RoleStatus } from 'src/common/enums/role_status';
import { FullDetailsCustomerStoreViewDto, PaginatedCustomerStoreViewDto, StoreCustomerViewDto } from './dto/responses/customer-store.dto';
import { StoreWithTokenDto } from './dto/responses/store-with-token.dto';
import { StoreAdminViewDto } from './dto/responses/admin-store.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { UpdateStoreLegalInfoDto } from './dto/requests/update-store-legal.dto';
import { PermissionKey } from 'src/common/enums/permission-key';

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
  @ApiQuery({ name: 'ownerId', required: false, example: 1 })
  @PermissionGuard([RoleStatus.OWNER,RoleStatus.ADMIN],PermissionKey.CreateStore,CompletedProfileGuard)
  async initialCreate(@Body() dto: InitialCreateStoreDto,@CurrentUser() user: CurrentUserType,@I18n() i18n: I18nContext,) 
  {
    const lang = getLang(i18n);
    const {context} = user
    return this.storeAuthService.initialCreation(context.id, dto, lang);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new store (Owner only)' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateStoreDto })
  @ApiQuery({ name: 'ownerId', required: false, example: 1 })
  @ApiResponse({status: 200,description: 'Store created successfully',schema: { example: { message: 'Created successfully' } },})
  @PermissionGuard([RoleStatus.OWNER,RoleStatus.ADMIN],PermissionKey.CreateStore)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'commercialRegisterFile', maxCount: 1 },
        { name: 'taxNumberFile', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  async create(@Body() body: CreateStoreDto,@CurrentUser() user: CurrentUserType,@I18n() i18n: I18nContext,@UploadedFiles()    
    files: {
      logo?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      commercialRegisterFile?: Express.Multer.File[];
      taxNumberFile?: Express.Multer.File[];
    },
  ) {
    const logo = files.logo?.[0];
    const cover = files.cover?.[0]
    const commercialRegisterFile = files.commercialRegisterFile?.[0];
    const taxNumberFile = files.taxNumberFile?.[0];
    const openingHours = validateAndParseOpeningHours(body.openingHours);
    const lang = getLang(i18n);
    const {context} = user

    return this.storeAuthService.create(body,context.id,openingHours as OpeningHourEnum[],lang,logo,cover,commercialRegisterFile,taxNumberFile);
  }

  @Serilaize(StoreWithTokenDto)
  @Post('login')
  @ApiOperation({ summary: 'Login store and return access & refresh tokens' })
  @ApiBody({ type: LoginStoreDto })
  @ApiResponse({status: 200,description: 'Store login successful',type: StoreWithTokenDto})
  login(@Body() body: LoginStoreDto,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.storeAuthService.login(body,lang);
  }

  @Serilaize(IncompleteStoreResponseDto)
  @Get('incomplete')
  @PermissionGuard([RoleStatus.OWNER,RoleStatus.ADMIN],PermissionKey.ViewStores)
  @ApiOperation({ summary: 'Get incomplete store info for owner' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'ownerId', required: false, example: 1 })
  @ApiResponse({status: 200,description: 'Incomplete store info if exists',type: IncompleteStoreResponseDto})
  async getIncompleteStore(@CurrentUser() user: CurrentUserType, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    const {context} = user
    return this.storeService.getIncompleteStoreInfo(context.id, lang);
  }

  @Serilaize(CurrentStoreDTO)
  @PermissionGuard([RoleStatus.STORE])
  @Get('current')
  @ApiOperation({ summary: 'Get Current Store With Basic details (owner or store only)' })
  @ApiSecurity('access-token')
  @ApiResponse({status: 200,type: CurrentStoreDTO})
  getCurrentStore(@CurrentUser() user:CurrentUserType)
  {
    const {context} = user
    return this.storeService.getCurrentStore(context.id)
  }

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.ViewStores)
  @Serilaize(storeForAction)
  @Get('action/current')
  @ApiOperation({ summary: 'Get full details of a store by ID for actions (owner or store only)' })
  @ApiResponse({status: 200,description: 'full details of store',type: storeForAction})
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiSecurity('access-token')
  async getStoreDetailsForAction(@CurrentUser() user:CurrentUserType,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    const {context} = user
    return this.storeService.getStoreDetailsForAction(context.id,lang)
  }

  @Get('byOwner')
  @ApiOperation({ summary: 'Get all stores of the owner' })
  @ApiResponse({status: 200,type: [OwnerStoresResponseDto]})
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'ownerId', required: false, example: 1 })
  @Serilaize(OwnerStoresResponseDto)
  @PermissionGuard([RoleStatus.OWNER,RoleStatus.ADMIN],PermissionKey.ViewStores)
  findStoresByOwner(@CurrentUser() user: CurrentUserType,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    const {context} = user
    return this.storeService.findStoresByOwner(context.id,lang);
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

  @Get('admin/all')
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewStores)
  @ApiOperation({ summary: 'Get all stores for admin, with optional status and filters' })
  @ApiQuery({ name: 'type', required: false, type: Number, description: 'Filter by store type ID' })
  @ApiQuery({ name: 'subType', required: false, type: Number, description: 'Filter by store sub-type ID' })
  @ApiQuery({ name: 'status', required: false, enum: StoreStatus, description: 'Filter by store status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number, default is 1' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page, default is 10' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by store name' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Filter by city' })
  @ApiQuery({ name: 'phone', required: false, type: String, description: 'Filter by store phone' })
  @ApiQuery({ name: 'commercialRegister', required: false, type: String, description: 'Filter by commercial register' })
  @ApiQuery({ name: 'createdAt', required: false, type: String, description: 'Filter by creation date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Paginated list of stores', type: PaginatedCustomerStoreViewDto })
  @ApiSecurity('access-token')
  @Serilaize(PaginatedCustomerStoreViewDto)
  findAllStoresForAdmin(
    @I18n() i18n: I18nContext,
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('phone') phone?: string,
    @Query('commercialRegister') commercialRegister?: string,
    @Query('dateFilter') dateFilter?:string,
    @Query('type', new ParseIntPipe({ optional: true })) type?: number,
    @Query('subType', new ParseIntPipe({ optional: true })) subType?: number,
    @Query('status') status?: StoreStatus,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const lang = getLang(i18n);
    return this.storeService.findAllStoresForAdmin(
      lang,
      page,
      limit,
      status,
      type,
      subType,
      name,
      city,
      phone,
      commercialRegister,
      dateFilter
    );
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewStores)
  @Get('admin/all/incomplete')
  @ApiOperation({ summary: 'Get all incomplete stores (for admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number, default is 1' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page, default is 10' })
  @ApiResponse({status: 200,type: PaginatedAdminIncompleteStoresDto,})
  @Serilaize(PaginatedAdminIncompleteStoresDto)
  getAllIncompleteStores(
    @I18n() i18n: I18nContext,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const lang = getLang(i18n);
    return this.storeService.getAllIncompleteStores(lang, page, limit);
  }

  @PermissionGuard([RoleStatus.CUSTOMER])
  @Serilaize(FullDetailsCustomerStoreViewDto)
  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a store by ID (customer only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the store', example: 1 })
  @ApiQuery({ name: 'lat', required: false, description: 'Customer latitude', example: 31.5 })
  @ApiQuery({ name: 'lng', required: false, description: 'Customer longitude', example: 35.1 })
  @ApiResponse({status: 200,description: 'full details of store',type: FullDetailsCustomerStoreViewDto})
  async getFullDetailsStore(
    @Param('id') storeId: number,
    @I18n() i18n: I18nContext,
    @CurrentUser() user:CurrentUserType,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string
  ) {
    const lang = getLang(i18n);
    const {context} = user
    const customerLat = lat ? parseFloat(lat) : undefined;
    const customerLng = lng ? parseFloat(lng) : undefined;
    return this.storeService.getFullDetailsStore(storeId, lang,context.id,customerLat,customerLng);
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewStores)
  @Get('admin/:id/details')
  @ApiOperation({ summary: 'Get full store details (Admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Store ID' })
  @ApiResponse({status: 200,type: StoreAdminViewDto})
  @ApiSecurity('access-token')
  @Serilaize(StoreAdminViewDto)
  getFullDetailsStoreAdmin(
    @I18n() i18n: I18nContext,
    @Param('id', ParseIntPipe) storeId: number,
  ) {
    const lang = getLang(i18n);
    return this.storeService.getFullDetailsStoreAdmin(storeId, lang);
  }

  @Serilaize(StoreCustomerViewDto)
  @Get('guest/:id')
  @ApiOperation({ summary: 'Get full details of a store by ID (guest)' })
  @ApiParam({ name: 'id', description: 'ID of the store', example: 1 })
  @ApiQuery({ name: 'lat', required: false, description: 'Customer latitude', example: 31.5 })
  @ApiQuery({ name: 'lng', required: false, description: 'Customer longitude', example: 35.1 })
  @ApiResponse({ status: 200, description: 'full details of store', type: StoreCustomerViewDto })
  async getFullDetailsStoreGuest(
    @Param('id') storeId: number,
    @I18n() i18n: I18nContext,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string
  ) {
    const lang = getLang(i18n);
    const customerLat = lat ? parseFloat(lat) : undefined;
    const customerLng = lng ? parseFloat(lng) : undefined;
    return this.storeService.getFullDetailsStore(storeId, lang,customerLat,customerLng);
  }

  @Put('/:storeId/approved')
  @ApiOperation({ summary: 'Approve a store (Admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to approve', example: 5 })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ChangeStoreStatus)
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

  @Put('/:storeId/suspend')
  @ApiOperation({ summary: 'Suspend a store (Admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to suspend', example: 5 })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ChangeStoreStatus)
  @ApiResponse({
    status: 200,
    description: 'Store suspended successfully',
    schema: {
      example: {
        message: 'Store status updated to SUSPENDED',
        storeId: 5,
      },
    },
  })
  suspendStore(
    @Param('storeId') storeId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.storeService.changeStoreStatus(StoreStatus.SUSPENDED, +storeId, lang);
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
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ChangeStoreStatus)
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
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateStore)
  updateStore(@CurrentUser() user: CurrentUserType, @Body() dto: UpdateStoreDto,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    const {context} = user
    return this.storeService.updateStore(context, dto,lang);
  }

  @Put('update-images')
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateStore)
  @ApiOperation({ summary: 'Update store images (logo / cover)' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
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
    @CurrentUser() user: CurrentUserType,
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
    const {context} = user
    return this.storeService.updateStoreImages(context, logo, cover,lang);
  }

  @Put('update-legal-info')
  @PermissionGuard([RoleStatus.STORE, RoleStatus.ADMIN],PermissionKey.UpdateStore)
  @ApiOperation({ summary: 'Update store legal information (tax number & commercial register)' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({type:UpdateStoreLegalInfoDto})
  @ApiResponse({status: 200,schema: {example: {message: 'Legal info updated successfully'}}})
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'taxNumberFile', maxCount: 1 },
        { name: 'commercialRegisterFile', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  async updateLegalInfo(
    @CurrentUser() user: CurrentUserType,
    @UploadedFiles()
    files: {
      taxNumberFile?: Express.Multer.File[];
      commercialRegisterFile?: Express.Multer.File[];
    },
    @Body() dto: UpdateStoreLegalInfoDto,
  ) {
    const taxNumberFile = files.taxNumberFile?.[0];
    const commercialRegisterFile = files.commercialRegisterFile?.[0];
    const { context } = user;
    return this.storeService.updateStoreLegalInfo(context, dto, taxNumberFile, commercialRegisterFile);
  }

  @Get('favourite/byCustomer')
  @ApiOperation({ summary: 'Get favourite stores for the current customer' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'type', required: false, type: Number, description: 'Filter by store type ID' })
  @ApiResponse({status: 200,description: 'List of favourite stores with pagination',type: PaginatedCustomerStoreViewDto})
  @Serilaize(PaginatedCustomerStoreViewDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  getFavouriteStoresByCustomer(
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext,
    @Query('type', new ParseIntPipe({ optional: true })) type?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10) 
    {
    const lang = getLang(i18n);
    const {context} = user
    return this.storeService.getFavouriteStoresByCustomer(context.id,lang,page,limit,type);
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
  @ApiQuery({ name: 'ownerId', required: false, example: 1 })
  @ApiBody({ type: SelectOwnerForStoreDto })
  @PermissionGuard([RoleStatus.OWNER])
  selectStoreForOwner(@CurrentUser() user:CurrentUserType,@Param('storeId') storeId:number,@Body() dto:SelectOwnerForStoreDto,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n)
    const {context} = user
    return this.storeAuthService.selectStoreForOnwer(storeId,context.id,dto,lang)
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
  @PermissionGuard([RoleStatus.STORE])
  @ApiOperation({ summary: 'Update store password (Store or Owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: UpdatePasswordDto })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: { example: { message: 'Password updated successfully' } },
  })
  async updatePassword(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdatePasswordDto,
  ) {
    const {context} = user
    return this.storeAuthService.updatePassword(context, dto);
  }

  @PermissionGuard([RoleStatus.STORE])
  @Post('logout')
  @ApiOperation({ summary: 'Logout store and invalidate refresh token' })
  @ApiBody({type:RefreshTokenDto})
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'Store logged out successfully',
    schema: { example: { message: 'Logged out successfully' } },
  })
  async logoutStore(@CurrentUser() user: CurrentUserType,@Body() body:RefreshTokenDto) {
    const {context} = user
    await this.userTokenService.logout(body);
    await this.fcmTokenService.removeTokenByDevice(context.id,body.deviceId,RoleStatus.STORE);
    return {message:"logout success"}
  }
}