import {forwardRef, Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponProvider } from './providers/coupon.provider';
import { OrderModule } from '../order/order.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [CouponController],
  providers: [CouponService, ...CouponProvider],
  imports: [forwardRef(()=>UserContextModule),forwardRef(()=>OrderModule)],
  exports:[CouponService]
})
export class CouponModule {}
