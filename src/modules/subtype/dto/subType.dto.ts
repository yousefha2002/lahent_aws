import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SubTypeLanguageDto {
  @ApiProperty({ example: '1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'حلويات' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'ar' })
  @Expose()
  languageCode: string;
}

export class SubTypeDto {
  @ApiProperty({ example: '1' })
  @Expose()
  id: string;

  @ApiProperty({ type: [SubTypeLanguageDto] })
  @Expose()
  @Type(() => SubTypeLanguageDto)
  languages: SubTypeLanguageDto[];
}
