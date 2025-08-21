import { Controller, Post } from '@nestjs/common';
import { EdfapayService } from './edfapay.service';

@Controller('edfapay')
export class EdfapayController {
  constructor(private readonly edfapayService: EdfapayService) {}

  @Post('notification')
  async notification() {
    return this.edfapayService.handleNotification()
  }
}