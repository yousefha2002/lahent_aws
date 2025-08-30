import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCartProductDto {
  @ApiProperty({ example: 25, description: 'Product ID' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of product' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ type: [Number], example: [101, 102], description: 'Selected variant IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  variants: number[];

  @ApiPropertyOptional({ type: [Number], example: [201], description: 'Instruction IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  instructions: number[];

  @ApiPropertyOptional({ type: [Number], example: [301, 302], description: 'Extra option IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  extras: number[];

  @ApiPropertyOptional({ example: 'No onions please', description: 'Additional note' })
  @IsOptional()
  note: string;
}