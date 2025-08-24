import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCartProductDto {
  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  variants: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  instructions: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  extras: number[];

  @IsOptional()
  note: string;
}
