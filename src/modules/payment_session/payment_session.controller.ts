import {Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentSessionService } from './payment_session.service';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CustomerGuard } from 'src/common/guards/customer.guard';

@Controller('payment-session')
export class PaymentSessionController {
  constructor(private readonly paymentSessionService: PaymentSessionService) {}

  @ApiOperation({ summary: 'Check payment status by paymentId (customer only)' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Payment status returned successfully' })
  @ApiResponse({ status: 404, description: 'Payment session not found' })
  @ApiSecurity('access-token')
  @UseGuards(CustomerGuard)
  @Get('status/:paymentId')
  async checkStatus(@Param('paymentId') paymentId: number) {
    return this.paymentSessionService.checkPaymentStatus(paymentId);
  }
}
