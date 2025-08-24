import { Expose, Type } from 'class-transformer';

export class CategoryTranslationDto {
  @Expose()
  lang: string;

  @Expose()
  title: string;

  @Expose()
  languageCode:string
}

export class SimpleCategoryDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => CategoryTranslationDto)
  languages: CategoryTranslationDto[];
}

export class CategoryDto extends SimpleCategoryDto{
  @Expose()
  productCount:number
}