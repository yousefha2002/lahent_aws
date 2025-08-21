import { IsNotEmpty, IsString } from "class-validator";

export class ActionGiftCategoryDto {
    @IsString()
    @IsNotEmpty()
    name:string
}