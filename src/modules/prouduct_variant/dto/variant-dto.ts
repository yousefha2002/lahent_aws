import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { Language } from "src/common/enums/language";

export class VariantDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Extra Cheese' })
    name: string;

    @Expose()
    @ApiProperty({ example: 5 })
    additional_price: number;

    @Expose()
    @ApiProperty({ example: 'https://example.com/image.png', nullable: true })
    imageUrl: string | null;
}

export class ProductVariantLanguageDto {
    @Expose()
    @IsString()
    @IsIn(Object.values(Language))
    @ApiProperty({ example: 'en' })
    languageCode: Language;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Extra Cheese' })
    name: string;
}

export class ProductVariantDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 5 })
    additional_price: number;

    @Expose()
    @ApiProperty({ example: 'https://example.com/image.png', nullable: true })
    imageUrl: string | null;

    @Expose()
    @ApiProperty({ example: true })
    isActive: boolean;

    @Expose()
    @Type(() => ProductVariantLanguageDto)
    @ApiProperty({ type: [ProductVariantLanguageDto] })
    languages: ProductVariantLanguageDto[];
}