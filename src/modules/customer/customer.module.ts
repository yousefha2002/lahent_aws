import { CustomerProvider } from './providers/customer.provider';
import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { AvatarModule } from '../avatar/avatar.module';
import { UserTokenModule } from '../user_token/user_token.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';
import { FcmTokenModule } from '../fcm_token/fcm_token.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, ...CustomerProvider],
  imports: [
    AvatarModule,
    UserTokenModule,
    DatabaseModule,
    FcmTokenModule,
    AuditLogModule,
    forwardRef(()=>UserContextModule)
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
