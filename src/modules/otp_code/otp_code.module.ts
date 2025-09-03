import { forwardRef, Module } from '@nestjs/common';
import { OtpCodeService } from './otp_code.service';
import { OtpCodeController } from './otp_code.controller';
import { OptCodeProvider } from './providers/opt_code.provider';
import { SmsModule } from '../sms/sms.module';
import { CustomerModule } from '../customer/customer.module';
import { OwnerModule } from '../owner/owner.module';
import { UserTokenModule } from '../user_token/user_token.module';

@Module({
  controllers: [OtpCodeController],
  providers: [OtpCodeService, ...OptCodeProvider],
  exports: [OtpCodeService],
  imports:[SmsModule,forwardRef(() => CustomerModule),OwnerModule,UserTokenModule]
})
export class OtpCodeModule {}
