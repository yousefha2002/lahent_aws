import { ProductExtraLanguageProvider } from './providers/product_extra_language.provider';
import { forwardRef, Module } from '@nestjs/common';
import { ProductExtraService } from './product_extra.service';
import { ProductExtraController } from './product_extra.controller';
import { ProductExtraProvider } from './providers/product_extra.provider';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { DatabaseModule } from 'src/database/database.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [ProductExtraController],
  providers: [ProductExtraService, ...ProductExtraProvider,...ProductExtraLanguageProvider],
  exports: [ProductExtraService],
  imports: [StoreModule, OwnerModule, forwardRef(() => ProductModule),DatabaseModule,AdminModule],
})
export class ProductExtraModule {}
