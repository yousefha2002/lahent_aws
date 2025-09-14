import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartProvider } from './providers/cart.provider';
import { CustomerModule } from '../customer/customer.module';
import { StoreModule } from '../store/store.module';
import { CartItemModule } from '../cart_item/cart_item.module';
import { ProductModule } from '../product/product.module';
import { CartItemExtraModule } from '../cart_item_extra/cart_item_extra.module';
import { DatabaseModule } from 'src/database/database.module';
import { CartItemInstructionModule } from '../cart_item_instruction/cart_item_instruction.module';
import { CartItemVariantModule } from '../cart_item_variant/cart_item_variant.module';
import { OfferModule } from '../offer/offer.module';
import { ProuductVariantModule } from '../prouduct_variant/prouduct_variant.module';
import { LoyaltySettingModule } from '../loyalty_setting/loyalty_setting.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  controllers: [CartController],
  providers: [CartService, ...CartProvider],
  imports: [
    CustomerModule,
    StoreModule,
    CartItemModule,
    ProductModule,
    CartItemExtraModule,
    CartItemInstructionModule,
    CartItemVariantModule,
    DatabaseModule,
    OfferModule,
    ProuductVariantModule,
    LoyaltySettingModule,
    CouponModule
  ],
  exports:[CartService]
})
export class CartModule {}
