import { Controller, Post } from '@nestjs/common';
import { EdfapayService } from './edfapay.service';

@Controller('api/edfapay')
export class EdfapayController {
  constructor(private readonly edfapayService: EdfapayService) {}

  @Post('webhook')
  async notification() {
    return this.edfapayService.handleNotification()
  }
}