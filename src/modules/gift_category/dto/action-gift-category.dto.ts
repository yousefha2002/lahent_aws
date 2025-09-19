import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GiftCategoryLanguage {
  @ApiProperty({example:"أعياد"})
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(20, { message: 'Name must be at most 20 characters' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({example:"ar"})
  languageCode: string;
}

export class CreateGiftCategoryDto {
  @ApiProperty({type:[GiftCategoryLanguage]})
  @IsNotEmpty({ each: true })
  languages: GiftCategoryLanguage[];
}