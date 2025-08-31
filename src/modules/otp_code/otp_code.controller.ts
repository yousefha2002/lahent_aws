import { Body, Controller, Post } from '@nestjs/common';
import { OtpCodeService } from './otp_code.service';
import { SendOtpDto } from './dto/send_otp.dto';
import { VerifyOtpDto } from './dto/verify_opt.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CustomerOtpSendToken, CustomerOtpVerifyToken } from './dto/customer-otp.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OwnerOtpSendToken, OwnerOtpVerifyToken } from './dto/owner-otp.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('otp-code')
export class OtpCodeController {
  constructor(private readonly otpCodeService: OtpCodeService) {}

  @ApiOperation({ summary: 'Verify OTP for owner' })
  @Serilaize(OwnerOtpVerifyToken)
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 201,
    description: 'OTP verified successfully for owner',
    type: OwnerOtpVerifyToken
  })
  @Post('verify/owner')
  async verifyOtpOwner(
    @Body() body: VerifyOtpDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.otpCodeService.verifyOtp(body.phone, 'owner', body.code, lang);
  }

  @ApiOperation({ summary: 'Verify OTP for customer' })
  @Serilaize(CustomerOtpVerifyToken)
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 201,
    description: 'OTP verified successfully for customer',
    type: CustomerOtpVerifyToken
  })
  @Post('verify/customer')
  async verifyOtpCustomer(
    @Body() body: VerifyOtpDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.otpCodeService.verifyOtp(body.phone, 'customer', body.code, lang);
  }

  @ApiOperation({ summary: 'Send OTP to owner' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully to owner',
    type: OwnerOtpSendToken,
  })
  @Serilaize(OwnerOtpSendToken)
  @Post('send/owner')
  sendOtpForOwner(
    @Body() body: SendOtpDto,
  ) {
    return this.otpCodeService.sendOtp(body, 'owner');
  }

  @ApiOperation({ summary: 'Send OTP to customer' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully to customer',
    type: CustomerOtpSendToken,
  })
  @Post('send/customer')
  sendOtpForCustomer(
    @Body() body: SendOtpDto,
  ) {
    return this.otpCodeService.sendOtp(body, 'customer');
  }
}