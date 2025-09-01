import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CategoryTranslationDto {
  @ApiProperty({ example: 'مشروبات' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'ar' })
  @Expose()
  languageCode: string;
}

export class SimpleCategoryDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ type: [CategoryTranslationDto] })
  @Expose()
  @Type(() => CategoryTranslationDto)
  languages: CategoryTranslationDto[];
}

export class CategoryDto extends SimpleCategoryDto {
  @ApiProperty({ example: 12 })
  @Expose()
  productCount: number;
}