import { Expose, Type } from "class-transformer";
import { GiftTemplateDto } from "src/modules/gift_template/dto/gift-template.dto";

export class GiftCategoryListDto {
    @Expose()
    id:number

    @Expose()
    name:string
    
    @Expose()
    @Type(() => GiftTemplateDto)
    templates: GiftTemplateDto;
}