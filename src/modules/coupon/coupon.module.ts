import {forwardRef, Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponProvider } from './providers/coupon.provider';
import { OrderModule } from '../order/order.module';
import { UserContextModule } from '../user-context/user-context.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [CouponController],
  providers: [CouponService, ...CouponProvider],
  imports: [forwardRef(()=>UserContextModule),forwardRef(()=>OrderModule),AuditLogModule,DatabaseModule],
  exports:[CouponService]
})
export class CouponModule {}
