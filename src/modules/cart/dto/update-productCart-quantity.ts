import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCartProductQuantityDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
