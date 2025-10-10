import { forwardRef, Module } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { CartItemController } from './cart_item.controller';
import { CartItemProvider } from './providers/cart_item.provider';
import { OfferModule } from '../offer/offer.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService, ...CartItemProvider],
  exports: [CartItemService],
  imports:[forwardRef(()=>UserContextModule),OfferModule]
})
export class CartItemModule {}
