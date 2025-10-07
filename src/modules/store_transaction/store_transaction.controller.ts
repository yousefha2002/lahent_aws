import { Controller, Get, Query, UseGuards, ParseIntPipe, Post, Body } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedStoreTransactionDto } from './dto/store_transaction.dto';
import { StoreFinancialsFilterDto } from '../store/dto/requests/store-financials-filter.dto';
import { StoreFinancialsResponseDto } from './dto/store-financials-response.dto';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { StoreGuard } from 'src/common/guards/roles/store.guard';
import { StoreOrAdminGuard } from 'src/common/guards/roles/store-or-admin-guard';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { CreateAdminStoreTransactionDto } from './dto/create-transaction.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AdminGuard } from 'src/common/guards/roles/admin.guard';
import { getLang } from 'src/common/utils/get-lang.util';
import { AdminTransactionResponse } from './dto/admin-transaction-response.dto';

@Controller('store-transaction')
export class StoreTransactionController {
    constructor(private readonly storeTransactionService: StoreTransactionService) {}

    @Serilaize(PaginatedStoreTransactionDto)
    @UseGuards(StoreOrAdminGuard)
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

    @UseGuards(StoreOrAdminGuard)
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
    @UseGuards(StoreOrAdminGuard)
    @ApiOperation({ summary: 'Get store financials with filter' })
    @ApiQuery({ name: 'storeId', required: false, example: 1 })
    @ApiSecurity('access-token')
    @ApiResponse({ status: 200, description: 'Store financials', type: StoreFinancialsResponseDto })
    @Get('financials/byStore')
    async getStoreFinancials(
        @CurrentUser() user: CurrentUserType,
        @Query() query: StoreFinancialsFilterDto
    ) {
        const { filter, specificDate } = query;
        const {context} = user
        return this.storeTransactionService.getStoreFinancials(context.id, filter, specificDate);
    }

    @Serilaize(AdminTransactionResponse)
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Admin adds or withdraws money from store balance' })
    @ApiSecurity('access-token')
    @ApiBody({ type: CreateAdminStoreTransactionDto })
    @ApiResponse({ status: 201, description: 'Transaction created successfully', type: AdminTransactionResponse })
    @Post('admin/transaction')
    async adminTransaction(
        @Body() dto: CreateAdminStoreTransactionDto,
        @I18n() i18n: I18nContext
    ) {
        const lang = getLang(i18n);
        return this.storeTransactionService.createAdminTransaction(lang,dto);
    }
}