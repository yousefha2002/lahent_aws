import { Expose, Transform, Type } from 'class-transformer';

export class CarBrandDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => TypeLanguageDto)
  languages: TypeLanguageDto[];
}

export class TypeLanguageDto {
  @Expose()
  name: string;

  @Expose()
  languageCode: string;
}
