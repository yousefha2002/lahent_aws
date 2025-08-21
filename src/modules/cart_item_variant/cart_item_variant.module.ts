import { Module } from '@nestjs/common';
import { CartItemVariantService } from './cart_item_variant.service';
import { CartItemVariantController } from './cart_item_variant.controller';
import { CartItemVariantProvider } from './providers/cart_item_variant.provider';
import { ProuductVariantModule } from '../prouduct_variant/prouduct_variant.module';

@Module({
  controllers: [CartItemVariantController],
  providers: [CartItemVariantService, ...CartItemVariantProvider],
  exports: [CartItemVariantService],
  imports: [ProuductVariantModule],
})
export class CartItemVariantModule {}
