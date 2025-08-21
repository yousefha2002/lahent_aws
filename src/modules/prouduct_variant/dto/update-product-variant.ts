import { IsString, IsNumber, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { ProductVariantType } from 'src/common/enums/product_varaint_type';

export class UpdateProductVariantDto {
  @IsString()
  name: string;

  @IsEnum(ProductVariantType)
  @IsNotEmpty()
  type: ProductVariantType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  productId: number;
}
