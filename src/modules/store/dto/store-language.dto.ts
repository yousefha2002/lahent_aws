import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class StoreLanguageDto {
    @ApiProperty({ example: 'البيك' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'أديداس' })
    @Expose()
    brand: string;

    @ApiProperty({ example: 'ar' })
    @Expose()
    languageCode: string;
}