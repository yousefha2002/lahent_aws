import { Body, Controller, Post } from '@nestjs/common';
import { EdfapayService } from './edfapay.service';

@Controller('edfapay')
export class EdfapayController {
  constructor(private readonly edfapayService: EdfapayService) {}

  @Post('webhook')
  async notification(@Body() body: any) {
    return this.edfapayService.handleNotification(body)
  }
} 