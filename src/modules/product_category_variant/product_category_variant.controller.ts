import { Controller } from '@nestjs/common';
import { ProductCategoryVariantService } from './product_category_variant.service';

@Controller('product-category-variant')
export class ProductCategoryVariantController {
  constructor(private readonly productCategoryVariantService: ProductCategoryVariantService) {}
}
