import { ApiProperty } from "@nestjs/swagger";
import {IsOptional, IsString } from "class-validator";

export class UpdateGiftTemplateDto {
    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ example: "2025-12-31T23:59:59.000Z", required: false, nullable: true })
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: "2025-12-31T23:59:59.000Z", required: false, nullable: true })
    @IsOptional()
    endDate?: string;

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: true })
    image: any;
}