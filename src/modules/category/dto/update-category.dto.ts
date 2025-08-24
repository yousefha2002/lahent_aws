import {IsOptional,} from 'class-validator';
import { CategoryLanguageDto } from './create-category.dto';

export class UpdateCategoryDto {
    @IsOptional()
    languages?: CategoryLanguageDto[];
}