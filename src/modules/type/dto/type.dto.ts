import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TypeLanguageDto {
  @ApiProperty({ example: '1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'متجر' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'ar' })
  @Expose()
  languageCode: string;
}

export class TypeDto {
  @ApiProperty({ example: '1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v123456/icon.png' })
  @Expose()
  iconUrl: string;

  @ApiProperty({ type: [TypeLanguageDto] })
  @Expose()
  @Type(() => TypeLanguageDto)
  languages: TypeLanguageDto[];
}