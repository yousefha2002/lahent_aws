import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGiftTemplateDto {
    @ApiProperty({example:1})
    @IsString()
    @IsNotEmpty()
    categoryId:string

    @ApiProperty({ example: "2025-03-01", required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ example: "2025-03-30", required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}