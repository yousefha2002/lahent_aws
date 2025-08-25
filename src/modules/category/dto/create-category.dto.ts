import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryLanguageDto {
  @ApiProperty({ example: 'مشروبات', description: 'Title of the category' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(20, { message: 'Name must be at most 20 characters' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'ar', description: 'Language code' })
  @IsString()
  @IsNotEmpty()
  languageCode: string;
}

export class CreateCategoryDto {
  @ApiProperty({ type: [CategoryLanguageDto], description: 'List of category translations' })
  @IsNotEmpty({ each: true })
  languages: CategoryLanguageDto[];
}