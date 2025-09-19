import { Expose, Type } from "class-transformer";
import { BasicGiftTemplateDto } from "src/modules/gift_template/dto/gift-template.dto";

export class GiftCategoryListDto {
    @Expose()
    id:number

    @Expose()
    name:string
    
    @Expose()
    @Type(() => BasicGiftTemplateDto)
    templates: BasicGiftTemplateDto;
}