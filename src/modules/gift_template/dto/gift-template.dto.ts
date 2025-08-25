import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { GiftCategoryDto } from 'src/modules/gift_category/dto/gift-category.dto';

export class GiftTemplateDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: string;

  @ApiProperty({ example: 'https:/cloudinary/image.com' })
  @Expose()
  imageUrl: string;

  @ApiProperty({ type: () => GiftCategoryDto })
  @Expose()
  @Type(() => GiftCategoryDto)
  category: GiftCategoryDto;
}

export class PaginatedGiftTemplateDto {
  @ApiProperty({ example: 30 })
  @Expose()
  total: number;

  @ApiProperty({ example: 3 })
  @Expose()
  totalPages: number;

  @ApiProperty({ type: GiftTemplateDto })
  @Expose()
  @Type(() => GiftTemplateDto)
  data: GiftTemplateDto;
}
