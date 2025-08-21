import {
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsNotEmpty,
  IsInt,
} from 'class-validator';
import { ProductVariantType } from 'src/common/enums/product_varaint_type';
import { Transform } from 'class-transformer';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProductVariantType, { message: 'Invalid variant type' })
  @IsNotEmpty()
  type: ProductVariantType;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price must be a positive number' })
  @IsNotEmpty()
  price: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'productId must be an integer number' })
  @IsNotEmpty()
  productId: number;
}
