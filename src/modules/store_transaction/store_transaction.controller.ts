import { Controller, Get, Query, ParseIntPipe, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedStoreTransactionDto } from './dto/store_transaction.dto';
import { StoreFinancialsFilterDto } from '../store/dto/requests/store-financials-filter.dto';
import { StoreFinancialsResponseDto } from './dto/store-financials-response.dto';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { CreateAdminStoreTransactionDto } from './dto/create-transaction.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { AdminTransactionResponse } from './dto/admin-transaction-response.dto';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions, multerReceiptOptions } from 'src/multer/multer.options';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('store-transaction')
export class StoreTransactionController {
    constructor(private readonly storeTransactionService: StoreTransactionService) {}

    @Serilaize(PaginatedStoreTransactionDto)
    @PermissionGuard([RoleStatus.ADMIN,RoleStatus.STORE],PermissionKey.ViewStoreTransactions)
    @ApiOperation({ summary: 'Get all transactions for a store with pagination' })
    @ApiSecurity('access-token')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'status', required: false, example: StoreTransactionType.CANCELED })
    @ApiQuery({ name: 'storeId', required: false, example: 1 })
    @ApiResponse({ status: 200, description: 'List of transactions',type:PaginatedStoreTransactionDto })
    @Get('current-store')
    async getAll(
        @CurrentUser() user:CurrentUserType,
        @Query('page',new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit',new ParseIntPipe({ optional: true })) limit = 10,
        @Query('status') status?: StoreTransactionType,
    ) {
        const {context} = user
        return this.storeTransactionService.getAllByStore(context.id, page,limit,status);
    }

    @PermissionGuard([RoleStatus.ADMIN,RoleStatus.STORE],PermissionKey.ViewStoreTransactions)
    @ApiOperation({ summary: 'Get available balance for current store' })
    @ApiSecurity('access-token')
    @ApiResponse({ status: 200, description: 'Available balance of the store', type: Number})
    @ApiQuery({ name: 'storeId', required: false, example: 1 })
    @Get('available-balance')
    async getAvailableBalance(@CurrentUser() user: CurrentUserType) {
        const {context} = user
        const availableBalance = await this.storeTransactionService.findAvailableBalance(context.id);
        return availableBalance;
    }

    @Serilaize(StoreFinancialsResponseDto)
    @PermissionGuard([RoleStatus.ADMIN,RoleStatus.STORE],PermissionKey.ViewStoreTransactions)
    @ApiOperation({ summary: 'Get store financials with filter' })
    @ApiQuery({ name: 'storeId', required: false, example: 1 })
    @ApiSecurity('access-token')
    @ApiResponse({ status: 200, description: 'Store financials', type: StoreFinancialsResponseDto })
    @ApiQuery({ name: 'from', required: false, type: String, description: 'Filter by registration start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'to', required: false, type: String, description: 'Filter by registration end date (YYYY-MM-DD)' })
    @Get('financials/byStore')
    async getStoreFinancials(
        @CurrentUser() user: CurrentUserType,
        @Query() query: StoreFinancialsFilterDto,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const { filter, specificDate } = query;
        const {context} = user
        return this.storeTransactionService.getStoreFinancials(context.id, filter, specificDate,from,to);
    }

    @Serilaize(AdminTransactionResponse)
    @PermissionGuard([RoleStatus.ADMIN],PermissionKey.StoreBalanceAction)
    @ApiOperation({ summary: 'Admin adds or withdraws money from store balance' })
    @ApiSecurity('access-token')
    @ApiBody({ type: CreateAdminStoreTransactionDto })
    @UseInterceptors(FileInterceptor('receipt', multerReceiptOptions))
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Transaction created successfully', type: AdminTransactionResponse })
    @Post('admin/transaction')
    async adminTransaction(
        @Body() dto: CreateAdminStoreTransactionDto,
        @I18n() i18n: I18nContext,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const lang = getLang(i18n);
        return this.storeTransactionService.createAdminTransaction(lang,dto,file);
    }
}