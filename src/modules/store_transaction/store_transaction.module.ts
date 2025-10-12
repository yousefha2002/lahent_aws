import { StoreCommissionModule } from './../store_commission/store_commission.module';
import { forwardRef, Module } from '@nestjs/common';
import { StoreTransactionService } from './store_transaction.service';
import { StoreTransactionProvider } from './providers/store_transaction.provider';
import { StoreTransactionController } from './store_transaction.controller';
import { UserContextModule } from '../user-context/user-context.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { StoreModule } from '../store/store.module';

@Module({
  controllers: [StoreTransactionController],
  providers: [StoreTransactionService,...StoreTransactionProvider],
  imports:[StoreCommissionModule,forwardRef(()=>UserContextModule),CloudinaryModule,forwardRef(()=>StoreModule)],
  exports:[StoreTransactionService]
})
export class StoreTransactionModule {}
