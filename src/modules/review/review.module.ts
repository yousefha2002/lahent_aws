import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewProvider } from './providers/review.provider';
import { StoreModule } from '../store/store.module';
import { OrderModule } from '../order/order.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ...ReviewProvider],
  imports: [StoreModule, OrderModule,forwardRef(()=>UserContextModule)],
  exports:[ReviewService]
})
export class ReviewModule {}
