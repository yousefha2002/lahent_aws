import { CustomerProvider } from './providers/customer.provider';
import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { OtpCodeModule } from '../otp_code/otp_code.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AvatarModule } from '../avatar/avatar.module';
import { GiftModule } from '../gift/gift.module';
import { UserTokenModule } from '../user_token/user_token.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, ...CustomerProvider],
  imports: [
    OtpCodeModule,
    CloudinaryModule,
    AvatarModule,
    forwardRef(() => GiftModule),
    UserTokenModule,
    DatabaseModule
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
