import { PaymentRedirectDto } from './../payment_session/dto/payment-redirect.dto';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { ChargeWalletDTO } from './dto/charge-wallet.dto';
import { filterTypeTransaction } from 'src/common/types/filter-type-transaction';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedTransactionDto } from './dto/transaction.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  
  @Serilaize(PaymentRedirectDto)
  @ApiOperation({ summary: 'Charge wallet using loyalty offer' })
  @ApiParam({ name: 'loyaltyOfferId', description: 'Loyalty offer ID to charge wallet', type: Number })
  @ApiBody({ type: ChargeWalletDTO })
  @ApiResponse({status: 200,type: PaymentRedirectDto})
  @UseGuards(CustomerGuard)
  @Post('charge-wallet/:loyaltyOfferId')
  chargeWallet(@CurrentUser() user:Customer,@Param('loyaltyOfferId') loyaltyOfferId:number,@Body() dto:ChargeWalletDTO)
  {
    return this.transactionService.chargeWallet(loyaltyOfferId,user,dto)
  }

  @Serilaize(PaginatedTransactionDto)
  @UseGuards(CustomerGuard)
  @Get()
  async getTransactions(
    @CurrentUser() user: Customer,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('typeFilter') typeFilter: filterTypeTransaction = 'all'
  ) 
  {
    return this.transactionService.getTransactions(user.id,typeFilter,+page,+limit);
  }
}
