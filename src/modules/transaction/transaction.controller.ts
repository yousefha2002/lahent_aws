import { PaymentRedirectDto } from './../payment_session/dto/payment-redirect.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { ChargeWalletDTO } from './dto/charge-wallet.dto';
import { filterTypeTransaction } from 'src/common/types/filter-type-transaction';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedTransactionDto } from './dto/transaction.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  
  @Serilaize(PaymentRedirectDto)
  @ApiOperation({ summary: 'Charge wallet using loyalty offer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'loyaltyOfferId', description: 'Loyalty offer ID to charge wallet', type: Number })
  @ApiBody({ type: ChargeWalletDTO })
  @ApiResponse({status: 200,type: PaymentRedirectDto})
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Post('charge-wallet/:loyaltyOfferId')
  chargeWallet(@CurrentUser() user:CurrentUserType,@Param('loyaltyOfferId') loyaltyOfferId:number,@Body() dto:ChargeWalletDTO)
  {
    const {context} = user
    return this.transactionService.chargeWallet(loyaltyOfferId,context,dto)
  }

  @Serilaize(PaginatedTransactionDto)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get paginated list of transactions for the current customer' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items per page' })
  @ApiQuery({ 
    name: 'typeFilter', 
    required: false, 
    enum: ['all', 'deposit', 'purchase', 'refund', 'gift'],
    example: 'all', 
    description: 'Filter transactions by type' 
  })
  @ApiOkResponse({ type: PaginatedTransactionDto, description: 'Paginated transactions list' })
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Get()
  async getTransactions(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('typeFilter') typeFilter: filterTypeTransaction = 'all'
  ) 
  {
    const {context} = user
    return this.transactionService.getTransactions(context.id,typeFilter,+page,+limit);
  }
}
