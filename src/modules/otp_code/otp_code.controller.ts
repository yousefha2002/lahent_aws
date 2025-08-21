import { Body, Controller, Post, Query } from '@nestjs/common';
import { OtpCodeService } from './otp_code.service';
import { SendOtpDto } from './dto/send_otp.dto';
import { VerifyOtpDto } from './dto/verify_opt.dto';
import { Language } from 'src/common/enums/language';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CustomerOtpSendToken, CustomerOtpVerifyToken } from './dto/customer-otp.dto';

@Controller('otp-code')
export class OtpCodeController {
  constructor(private readonly otpCodeService: OtpCodeService) {}

  @Post('verify/owner')
  async verifyOtpOwner(@Body() body: VerifyOtpDto, @Query('lang') lang = Language.en) {
    return this.otpCodeService.verifyOtp(body.phone, 'owner', body.code, lang);
  }

  @Serilaize(CustomerOtpVerifyToken)
  @Post('verify/customer')
  async verifyOtpCustomer(@Body() body: VerifyOtpDto, @Query('lang') lang = Language.en) {
    return this.otpCodeService.verifyOtp(body.phone, 'customer', body.code, lang);
  }

  @Serilaize(CustomerOtpSendToken)
  @Post('send/owner')
  sendOtpForStore(@Body() body: SendOtpDto,@Query('lang') lang=Language.en) {
      return this.otpCodeService.sendOtp(body, 'owner', lang);
  }

  @Post('send/customer')
  sendOtpForCustomer(@Body() body: SendOtpDto,@Query('lang') lang=Language.en) {
      return this.otpCodeService.sendOtp(body, 'customer', lang);
  }
}