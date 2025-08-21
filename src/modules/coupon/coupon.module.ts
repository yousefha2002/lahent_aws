import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponProvider } from './providers/coupon.provider';
import { AdminModule } from '../admin/admin.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';

@Module({
  controllers: [CouponController],
  providers: [CouponService, ...CouponProvider],
  imports: [AdminModule, StoreModule, OwnerModule],
  exports:[CouponService]
})
export class CouponModule {}
