import { forwardRef, Module } from '@nestjs/common';
import { ProductExtraService } from './product_extra.service';
import { ProductExtraController } from './product_extra.controller';
import { ProductExtraProvider } from './providers/product_extra.provider';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';

@Module({
  controllers: [ProductExtraController],
  providers: [ProductExtraService, ...ProductExtraProvider],
  exports: [ProductExtraService],
  imports: [StoreModule, OwnerModule, forwardRef(() => ProductModule)],
})
export class ProductExtraModule {}
