import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedStoreTransactionDto } from './dto/store_transaction.dto';
import { StoreFinancialsFilterDto } from '../store/dto/requests/store-financials-filter.dto';
import { StoreFinancialsResponseDto } from './dto/store-financials-response.dto';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { StoreGuard } from 'src/common/guards/store.guard';

@Controller('store-transaction')
export class StoreTransactionController {
    constructor(private readonly storeTransactionService: StoreTransactionService) {}

    @Serilaize(PaginatedStoreTransactionDto)
    @UseGuards(StoreGuard)
    @ApiOperation({ summary: 'Get all transactions for a store with pagination' })
    @ApiSecurity('access-token')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'status', required: false, example: StoreTransactionType.CANCELED })
    @ApiResponse({ status: 200, description: 'List of transactions',type:PaginatedStoreTransactionDto })
    @Get('current-store')
    async getAll(
        @CurrentUser() store:Store,
        @Query('page',new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit',new ParseIntPipe({ optional: true })) limit = 10,
        @Query('status') status?: StoreTransactionType,
    ) {
        return this.storeTransactionService.getAllByStore(store.id, page,limit,status);
    }

    @UseGuards(StoreGuard)
    @ApiOperation({ summary: 'Get available balance for current store' })
    @ApiSecurity('access-token')
    @ApiResponse({ status: 200, description: 'Available balance of the store', type: Number})
    @Get('available-balance')
    async getAvailableBalance(@CurrentUser() store: Store) {
        const availableBalance = await this.storeTransactionService.findAvailableBalance(store.id);
        return availableBalance;
    }

    @Serilaize(StoreFinancialsResponseDto)
    @UseGuards(StoreGuard)
    @ApiOperation({ summary: 'Get store financials with filter' })
    @ApiSecurity('access-token')
    @ApiResponse({ status: 200, description: 'Store financials', type: StoreFinancialsResponseDto })
    @Get('financials/byStore')
    async getStoreFinancials(
        @CurrentUser() store: Store,
        @Query() query: StoreFinancialsFilterDto
    ) {
        const { filter, specificDate } = query;
        return this.storeTransactionService.getStoreFinancials(store.id, filter, specificDate);
    }
}