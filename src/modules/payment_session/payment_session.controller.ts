import {Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentSessionService } from './payment_session.service';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CustomerGuard } from 'src/common/guards/roles/customer.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Controller('payment-session')
export class PaymentSessionController {
  constructor(private readonly paymentSessionService: PaymentSessionService) {}

  @Serilaize(PaymentSessionDto)
  @ApiOperation({ summary: 'Check payment status by paymentId (customer only)' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID', example: 1 })
  @ApiResponse({ status: 200, type:PaymentSessionDto })
  @ApiResponse({ status: 404, description: 'Payment session not found' })
  @ApiSecurity('access-token')
  @UseGuards(CustomerGuard)
  @Get('status/:paymentId')
  async checkStatus(@Param('paymentId') paymentId: number) {
    return this.paymentSessionService.checkPaymentStatus(paymentId);
  }
}
