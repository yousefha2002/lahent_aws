import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { OrderProvider } from './providers/order.provider';
import { CartModule } from '../cart/cart.module';
import { CustomerModule } from '../customer/customer.module';
import { CouponModule } from '../coupon/coupon.module';
import { OrderItemExtraModule } from '../order_item_extra/order_item_extra.module';
import { OrderItemModule } from '../order_item/order_item.module';
import { OrderItemInstructionModule } from '../order_item_instruction/order_item_instruction.module';
import { OrderItemVariantModule } from '../order_item_variant/order_item_variant.module';
import { CarModule } from '../car/car.module';
import { DatabaseModule } from 'src/database/database.module';
import { StoreModule } from '../store/store.module';
import { TransactionModule } from '../transaction/transaction.module';
import { PaymentSessionModule } from '../payment_session/payment_session.module';
import { UserPointHistoryModule } from '../user_point_history/user_point_history.module';
import { OwnerModule } from '../owner/owner.module';
import { OrderPaymentService } from './services/order-payment.service';
import { OrderPointsService } from './services/order_points.service';
import { OrderStatusService } from './services/order_status.service';
import { OfferModule } from '../offer/offer.module';
import { ProductModule } from '../product/product.module';
import { BullModule } from '@nestjs/bull';
import { OrderQueueScheduler } from './order.scheduler';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderPaymentService,
    OrderPointsService,
    OrderStatusService,
    ...OrderProvider,
    OrderQueueScheduler
  ],
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
      },
    }),
    BullModule.registerQueue({
      name: 'orders',
    }),
    CartModule,
    CustomerModule,
    CouponModule,
    OrderItemExtraModule,
    OrderItemModule,
    OrderItemInstructionModule,
    OrderItemVariantModule,
    CarModule,
    DatabaseModule,
    StoreModule,
    forwardRef(()=>TransactionModule),
    UserPointHistoryModule,
    OwnerModule,
    OfferModule,
    ProductModule,
    forwardRef(()=>PaymentSessionModule)
  ],
  exports: [OrderService,OrderPaymentService],
})
export class OrderModule {}