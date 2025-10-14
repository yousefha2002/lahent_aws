import { WalletService } from './services/wallet.service';
import { PaymentRedirectDto } from './../payment_session/dto/payment-redirect.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { ChargeWalletDTO } from './dto/charge-wallet.dto';
import { filterTypeTransaction } from 'src/common/types/filter-type-transaction';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedTransactionDto } from './dto/transaction.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { ApplePayResponseDto, ChargeWalletApplePayDTO } from './dto/charge-wallet-apple-pay.dto';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly walletService:WalletService
  ) {}
  
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
    return this.walletService.chargeWallet(loyaltyOfferId,context,dto)
  }

  @Serilaize(ApplePayResponseDto)
  @ApiOperation({ summary: 'Charge wallet using Apple Pay' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'loyaltyOfferId', type: Number })
  @ApiBody({ type: ChargeWalletApplePayDTO })
  @ApiResponse({ status: 200, description: 'Wallet charged successfully',type:ApplePayResponseDto })
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Post('charge-wallet/applepay/:loyaltyOfferId')
  chargeWalletWithApplePay(
    @CurrentUser() user: CurrentUserType,
    @Param('loyaltyOfferId') loyaltyOfferId: number,
    @Body() dto: ChargeWalletApplePayDTO
  ) {
    const { context } = user;
    return this.walletService.chargeWalletWithApplePay(loyaltyOfferId, context, dto);
  }

  @Serilaize(PaginatedTransactionDto)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get paginated list of transactions for the current customer' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items per page' })
  @ApiQuery({ name: 'customerId', required: false, example: 1 })
  @ApiQuery({ 
    name: 'typeFilter', 
    required: false, 
    enum: ['all', 'deposit', 'purchase', 'refund', 'gift'],
    example: 'all', 
    description: 'Filter transactions by type' 
  })
  @ApiOkResponse({ type: PaginatedTransactionDto, description: 'Paginated transactions list' })
  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN],PermissionKey.ViewCustomerTransactions)
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
