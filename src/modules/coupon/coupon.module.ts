import { forwardRef, Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponProvider } from './providers/coupon.provider';
import { AdminModule } from '../admin/admin.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { OrderModule } from '../order/order.module';

@Module({
  controllers: [CouponController],
  providers: [CouponService, ...CouponProvider],
  imports: [AdminModule, StoreModule, OwnerModule,forwardRef(()=>OrderModule)],
  exports:[CouponService]
})
export class CouponModule {}
