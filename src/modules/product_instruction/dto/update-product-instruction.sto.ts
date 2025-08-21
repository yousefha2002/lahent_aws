import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateProductInstructionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNumber()
  @IsNotEmpty()
  productId: number;
}
