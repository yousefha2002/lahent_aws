import { ProductExtraLanguageProvider } from './providers/product_extra_language.provider';
import { forwardRef, Module } from '@nestjs/common';
import { ProductExtraService } from './product_extra.service';
import { ProductExtraController } from './product_extra.controller';
import { ProductExtraProvider } from './providers/product_extra.provider';
import { ProductModule } from '../product/product.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [ProductExtraController],
  providers: [ProductExtraService, ...ProductExtraProvider,...ProductExtraLanguageProvider],
  exports: [ProductExtraService],
  imports: [forwardRef(() => ProductModule),DatabaseModule,forwardRef(()=>UserContextModule)],
})
export class ProductExtraModule {}
