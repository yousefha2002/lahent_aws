import { Type } from 'class-transformer';
import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { InstructionLanguageDto } from './instruction-dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductInstructionDto {
  @ApiProperty({
    description: 'ID of the product related to this instruction',
    example: 25,
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    description: 'List of instruction translations in different languages',
    type: [InstructionLanguageDto],
    example: [
      { language: 'en', title: 'No onions' },
      { language: 'ar', title: 'بدون بصل' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionLanguageDto)
  languages: InstructionLanguageDto[];
}
