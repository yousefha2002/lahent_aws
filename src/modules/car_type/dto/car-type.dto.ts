import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CarTypeLanguageDto {
  @ApiProperty({ example: 'HONDAY' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'en' })
  @Expose()
  languageCode: string;
}

export class CarTypeDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: string;

  @ApiProperty({ type: [CarTypeLanguageDto] })
  @Expose()
  @Type(() => CarTypeLanguageDto)
  languages: CarTypeLanguageDto[];
}
