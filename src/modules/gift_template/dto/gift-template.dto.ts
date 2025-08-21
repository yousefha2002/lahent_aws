import { Expose, Type } from 'class-transformer';
import { GiftCategoryDto } from 'src/modules/gift_category/dto/gift-category.dto';

export class GiftTemplateDto {
    @Expose()
    id: string;

    @Expose()
    imageUrl:string

    @Expose()
    @Type(() => GiftCategoryDto)
    category: GiftCategoryDto;
}

export class PaginatedGiftTemplateDto {
    @Expose()
    total:number

    @Expose()
    totalPages:number

    @Expose()
    @Type(() => GiftTemplateDto)
    data: GiftTemplateDto;
}