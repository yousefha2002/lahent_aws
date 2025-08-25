import {IsOptional,} from 'class-validator';
import { CategoryLanguageDto } from './create-category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
    @ApiProperty({ type: [CategoryLanguageDto], required: false })
    @IsOptional()
    languages?: CategoryLanguageDto[];
}