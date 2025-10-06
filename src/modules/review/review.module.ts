import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewProvider } from './providers/review.provider';
import { CustomerModule } from '../customer/customer.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { OrderModule } from '../order/order.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ...ReviewProvider],
  imports: [CustomerModule, StoreModule, OwnerModule, OrderModule,AdminModule],
  exports:[ReviewService]
})
export class ReviewModule {}
