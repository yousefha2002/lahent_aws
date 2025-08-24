import { Type } from 'class-transformer';
import { IsInt, IsNumber,IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { InstructionLanguageDto } from './instruction-dto';

export class UpdateProductInstructionDto {
  @IsInt()
  productId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionLanguageDto)
  languages: InstructionLanguageDto[];
}