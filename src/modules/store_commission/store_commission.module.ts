import { forwardRef, Module } from '@nestjs/common';
import { StoreCommissionService } from './store_commission.service';
import { StoreCommissionController } from './store_commission.controller';
import { StoreCommissionProvider } from './providers/store_commission.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [StoreCommissionController],
  providers: [StoreCommissionService,...StoreCommissionProvider],
  imports:[forwardRef(()=>UserContextModule)],
  exports:[StoreCommissionService]
})
export class StoreCommissionModule {}
