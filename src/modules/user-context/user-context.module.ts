import { forwardRef, Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';
import { UserContextController } from './user-context.controller';
import { AdminModule } from '../admin/admin.module';
import { CustomerModule } from '../customer/customer.module';
import { OwnerModule } from '../owner/owner.module';
import { StoreModule } from '../store/store.module';

@Module({
  controllers: [UserContextController],
  providers: [UserContextService],
  imports:[
    forwardRef(()=>AdminModule),
    forwardRef(()=>CustomerModule),
    forwardRef(()=>OwnerModule),
    forwardRef(()=>StoreModule)],
  exports:[UserContextService]
})
export class UserContextModule {}
