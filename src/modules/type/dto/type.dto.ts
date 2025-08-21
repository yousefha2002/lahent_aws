import { Expose, Transform, Type } from 'class-transformer';

export class TypeDto {
  @Expose()
  id: string;

  @Expose()
  iconUrl: string;

  @Expose()
  @Type(() => TypeLanguageDto)
  languages: TypeLanguageDto[];
}

export class TypeLanguageDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  languageCode: string;
}
