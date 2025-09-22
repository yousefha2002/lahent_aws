import { Controller } from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';

@Controller('payment-card')
export class PaymentCardController {
  constructor(private readonly paymentCardService: PaymentCardService) {}
}
