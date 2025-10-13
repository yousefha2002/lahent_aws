import { CustomerProvider } from './providers/customer.provider';
import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { AvatarModule } from '../avatar/avatar.module';
import { GiftModule } from '../gift/gift.module';
import { UserTokenModule } from '../user_token/user_token.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, ...CustomerProvider],
  imports: [
    S3Module,
    AvatarModule,
    forwardRef(() => GiftModule),
    UserTokenModule,
    DatabaseModule,
    forwardRef(()=>UserContextModule)
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
