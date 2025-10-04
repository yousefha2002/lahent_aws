import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { SimpleCategoryDto } from "src/modules/category/dto/category.dto";

export class ProductLanguageDto {
    @ApiProperty({ example: 'en' })
    @Expose()
    languageCode: string;

    @ApiProperty({ example: 'Burger' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'Tasty burger' })
    @Expose()
    shortDescription: string;

    @ApiProperty({ example: 'A very tasty burger made with fresh ingredients.' })
    @Expose()
    longDescription: string;
}

export class BaseProductDto {
    @ApiProperty({ example: 1 })
    @Expose() 
    id: number;

    @ApiProperty({ example: 25 })
    @Expose() 
    basePrice: number;

    @ApiProperty({ type: [ProductLanguageDto] })
    @Expose()
    @Type(() => ProductLanguageDto)
    languages: ProductLanguageDto[];

    @ApiProperty({ example: ['url1', 'url2'] })
    @Expose() 
    images: string[];

    @ApiProperty({ example: 10 })
    @Expose() 
    preparationTime: number;

    @ApiProperty({ type: SimpleCategoryDto })
    @Expose()
    @Type(()=>SimpleCategoryDto)
    category:SimpleCategoryDto
}