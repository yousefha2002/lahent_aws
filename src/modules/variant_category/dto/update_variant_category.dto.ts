import { PartialType } from '@nestjs/swagger';
import { CreateVariantCategoryDto } from './create_variant_category.dto';

export class UpdateVariantCategoryDto extends PartialType(CreateVariantCategoryDto) {}