import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { GiftTemplateDto } from 'src/modules/gift_template/dto/gift-template.dto';

export class TypeLanguageDto {
  @ApiProperty({ example: 'أعياد' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'ar' })
  @Expose()
  languageCode: string;
}

export class GiftCategoryDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: string;

  @ApiProperty({ type: [TypeLanguageDto] })
  @Expose()
  @Type(() => TypeLanguageDto)
  languages: TypeLanguageDto[];

  @ApiProperty({ type: () => GiftTemplateDto, isArray: true })
  @Expose()
  @Type(() => GiftTemplateDto)
  templates: GiftTemplateDto;
}

export class GiftCategoryDtoWithMessage {
  @Expose()
  message: string;

  @Expose()
  @Type(() => GiftCategoryDto)
  giftCategory: GiftCategoryDto;
}
