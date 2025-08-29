import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCartProductQuantityDto {
  @ApiProperty({example:3})
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
