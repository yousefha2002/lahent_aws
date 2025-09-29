import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class RelatedStoreLanguageDto {
    @Expose()
    @ApiProperty({ example: 'Baqa', description: 'Language name' })
    name: string;

    @Expose()
    @ApiProperty({ example: 'ar', description: 'Language code' })
    languageCode: string;
}

export class RelatedStoreDto {
    @Expose()
    @ApiProperty({ example: 40, description: 'Store ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: 'https://example.com/logo.png', description: 'Store logo URL' })
    logoUrl: string;

    @Expose()
    @Type(() => RelatedStoreLanguageDto)
    @ApiProperty({ type: [RelatedStoreLanguageDto], description: 'Store languages' })
    languages: RelatedStoreLanguageDto[];
}

export class RelatedOrderDto {
    @Expose()
    @ApiProperty({ example: 119, description: 'Order ID' })
    id: number;

    @Expose()
    @Type(() => RelatedStoreDto)
    @ApiProperty({ type: RelatedStoreDto })
    store: RelatedStoreDto;
}

    export class UserPointHistoryDto {
    @Expose()
    @ApiProperty({ example: 39, description: 'Point history ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: 'EARNED', description: 'Point action type' })
    type: string;

    @Expose()
    @ApiProperty({ example: 'ORDER', description: 'Point action source' })
    source: string;

    @Expose()
    @ApiProperty({ example: 13, description: 'Points earned or used' })
    points: number;

    @Expose()
    @Type(() => RelatedOrderDto)
    @ApiProperty({ type: RelatedOrderDto, required: false })
    relatedOrder?: RelatedOrderDto;

    @Expose()
    @ApiProperty({ example: '2025-09-29T08:33:01.000Z', description: 'Date created' })
    createdAt: Date;
}

export class PaginatedUserPointHistoryDto {
    @Expose()
    @ApiProperty({ example: 3, description: 'Total pages' })
    totalPages: number;

    @Expose()
    @ApiProperty({ example: 28, description: 'Total items' })
    totalItems: number;

    @Expose()
    @Type(() => UserPointHistoryDto)
    @ApiProperty({ type: [UserPointHistoryDto] })
    data: UserPointHistoryDto[];
}