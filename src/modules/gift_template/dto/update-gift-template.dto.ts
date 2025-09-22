import { ApiProperty } from "@nestjs/swagger";
import {IsOptional, IsString } from "class-validator";

export class UpdateGiftTemplateDto {
    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ example: "2025-03-01", required: false, nullable: true })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiProperty({ example: "2025-03-30", required: false, nullable: true })
    @IsOptional()
    @IsString()
    endDate?: string;
}