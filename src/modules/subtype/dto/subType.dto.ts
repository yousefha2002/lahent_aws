import { Expose, Type } from 'class-transformer';

export class SubTypeDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => SubTypeLanguageDto)
  languages: SubTypeLanguageDto[];
}

export class SubTypeLanguageDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  languageCode: string;
}
