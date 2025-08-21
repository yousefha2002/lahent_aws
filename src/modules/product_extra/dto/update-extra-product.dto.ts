import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateProductExtraDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  productId: number;
}
