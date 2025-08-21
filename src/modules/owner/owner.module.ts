import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { OwnerProvider } from './providers/owner.provider';
import { OtpCodeModule } from '../otp_code/otp_code.module';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, ...OwnerProvider],
  imports: [OtpCodeModule],
  exports: [OwnerService],
})
export class OwnerModule {}
