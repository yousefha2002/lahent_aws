import { Expose, Type } from 'class-transformer';
import { GiftTemplateDto } from 'src/modules/gift_template/dto/gift-template.dto';

export class GiftCategoryDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => TypeLanguageDto)
  languages: TypeLanguageDto[];

  @Expose()
  @Type(() => GiftTemplateDto)
  templates: GiftTemplateDto;
}

export class TypeLanguageDto {
  @Expose()
  name: string;

  @Expose()
  languageCode: string;
}

export class GiftCategoryDtoWithMessage {
  @Expose()
  message: string;

  @Expose()
  @Type(() => GiftCategoryDto)
  giftCategory: GiftCategoryDto;
}
