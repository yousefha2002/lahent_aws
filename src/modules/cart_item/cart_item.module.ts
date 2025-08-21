import { Module } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { CartItemController } from './cart_item.controller';
import { CartItemProvider } from './providers/cart_item.provider';
import { CustomerModule } from '../customer/customer.module';
import { OfferModule } from '../offer/offer.module';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService, ...CartItemProvider],
  exports: [CartItemService],
  imports:[CustomerModule,OfferModule]
})
export class CartItemModule {}
