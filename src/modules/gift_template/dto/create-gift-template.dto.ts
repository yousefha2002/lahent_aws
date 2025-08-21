import { IsNotEmpty, IsString } from "class-validator";

export class CreateGiftTemplateDto {
    @IsString()
    @IsNotEmpty()
    categoryId:string
}