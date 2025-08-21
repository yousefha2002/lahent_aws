import { Module } from '@nestjs/common';
import { CartItemExtraService } from './cart_item_extra.service';
import { CartItemExtraController } from './cart_item_extra.controller';
import { CartItemExtraProvider } from './providers/cart_item_extra.provider';
import { ProductExtraModule } from '../product_extra/product_extra.module';

@Module({
  controllers: [CartItemExtraController],
  providers: [CartItemExtraService, ...CartItemExtraProvider],
  exports: [CartItemExtraService],
  imports: [ProductExtraModule],
})
export class CartItemExtraModule {}
