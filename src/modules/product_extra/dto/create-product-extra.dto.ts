import {Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsIn, IsInt } from 'class-validator';
import { ProductExtraDto } from './extra-dto';

export class CreateProductExtraDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductExtraDto)
    extras: ProductExtraDto[];
}