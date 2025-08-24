import { Expose, Type } from 'class-transformer';

export class CarModelDto {
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
