import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CarBrandLanguageDto {
  @ApiProperty({ example: 'HONDAY' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'en' })
  @Expose()
  languageCode: string;
}

export class CarBrandDto {
  @ApiProperty({ example: '1' })
  @Expose()
  id: string;

  @ApiProperty({ type: [CarBrandLanguageDto] })
  @Expose()
  @Type(() => CarBrandLanguageDto)
  languages: CarBrandLanguageDto[];
}
