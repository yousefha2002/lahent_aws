import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedStoreTransactionDto } from './dto/store_transaction.dto';

@Controller('store-transaction')
export class StoreTransactionController {
    constructor(private readonly storeTransactionService: StoreTransactionService) {}

    @Serilaize(PaginatedStoreTransactionDto)
    @UseGuards(StoreOrOwnerGuard)
    @ApiOperation({ summary: 'Get all transactions for a store with pagination' })
    @ApiSecurity('access-token')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'storeId', required: false, example: '1' })
    @ApiResponse({ status: 200, description: 'List of transactions',type:PaginatedStoreTransactionDto })
    @Get('current-store')
    async getAll(
        @CurrentUser() store:Store,
        @Query('page',new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit',new ParseIntPipe({ optional: true })) limit = 10
    ) {
        return this.storeTransactionService.getAllByStore(store.id, page,limit);
    }
}
