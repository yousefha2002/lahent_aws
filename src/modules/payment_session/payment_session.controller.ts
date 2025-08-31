import {Controller, Get } from '@nestjs/common';
import { PaymentSessionService } from './payment_session.service';

@Controller('payment-session')
export class PaymentSessionController {
  constructor(private readonly paymentSessionService: PaymentSessionService) {}

  @Get()
  getAll()
  {
    return this.paymentSessionService.findAll()
  }
}
