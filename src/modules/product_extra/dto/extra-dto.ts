import { Expose, Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsString, ValidateNested, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Language } from "src/common/enums/language";

export class ExtraDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Extra Cheese' })
    name: string;

    @Expose()
    @ApiProperty({ example: 5 })
    additional_price: number;
}

export class ProductExtraLanguageDto {
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

export class ProductExtraDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @IsNumber()
    @ApiProperty({ example: 5 })
    additional_price: number;

    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductExtraLanguageDto)
    @ApiProperty({ type: [ProductExtraLanguageDto] })
    languages: ProductExtraLanguageDto[];

    @Expose()
    @ApiProperty({ example: true })
    isActive: boolean;
}