import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGiftTemplateDto {
    @ApiProperty({example:1})
    @IsString()
    @IsNotEmpty()
    categoryId:string

    @ApiProperty({ example: "2025-12-31T23:59:59.000Z", required: false })
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: "2025-12-31T23:59:59.000Z", required: false })
    @IsOptional()
    endDate?: string;

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: true })
    image: any;
}