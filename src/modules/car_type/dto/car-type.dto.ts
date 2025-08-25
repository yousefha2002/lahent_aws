import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class TypeLanguageDto {
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

  @ApiProperty({ type: [TypeLanguageDto] })
  @Expose()
  @Type(() => TypeLanguageDto)
  languages: TypeLanguageDto[];
}
