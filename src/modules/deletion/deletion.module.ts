import { Module } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { DeletionController } from './deletion.controller';
import { CustomerModule } from 'src/modules/customer/customer.module';
import { DatabaseModule } from 'src/database/database.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { UserTokenModule } from 'src/modules/user_token/user_token.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { FaviroteModule } from '../favirote/favirote.module';
import { ReviewModule } from '../review/review.module';
import { CategoryModule } from '../category/category.module';
import { StoreCommissionModule } from '../store_commission/store_commission.module';
import { DeletionCronService } from './deletion-cron.service';

@Module({
  controllers: [DeletionController],
  providers: [DeletionService,DeletionCronService],
  imports:[CustomerModule,DatabaseModule,AdminModule,UserTokenModule,StoreModule,OwnerModule,ProductModule,CartModule,
    FaviroteModule,CategoryModule,ReviewModule,StoreCommissionModule,OwnerModule
  ]
})
export class DeletionModule {}
