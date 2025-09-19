import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateGiftTemplateDto {
    @ApiProperty({example:1})
    @IsString()
    @IsNotEmpty()
    categoryId:string
}