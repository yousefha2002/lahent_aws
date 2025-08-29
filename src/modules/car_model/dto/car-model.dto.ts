import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CarModelLanguageDto {
  @ApiProperty({ example: 'HONDAY' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'en' })
  @Expose()
  languageCode: string;
}

export class CarModelDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: string;

  @ApiProperty({ type: [CarModelLanguageDto] })
  @Expose()
  @Type(() => CarModelLanguageDto)
  languages: CarModelLanguageDto[];
}
