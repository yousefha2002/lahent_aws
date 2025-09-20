import { Expose, Type } from 'class-transformer';
import { BasicGiftTemplateDto } from 'src/modules/gift_template/dto/gift-template.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OtherPartyDto {
    @ApiProperty({ example: 'Ali' })
    @Expose()
    name: string;

    @ApiProperty({ example: '970593411165' })
    @Expose()
    phone: string;
}

export class GiftDto {
    @ApiProperty({ example: 5 })
    @Expose()
    id: number;

    @ApiProperty({ example: 100 })
    @Expose()
    amount: number;

    @ApiProperty({ example: 'SENT', description: 'Direction of the gift: SENT or RECEIVED' })
    @Expose()
    direction: 'SENT' | 'RECEIVED';

    @ApiProperty({ type: () => BasicGiftTemplateDto })
    @Expose()
    @Type(() => BasicGiftTemplateDto)
    giftTemplate: BasicGiftTemplateDto;

    @ApiProperty({ type: () => OtherPartyDto })
    @Expose()
    @Type(() => OtherPartyDto)
    otherParty: OtherPartyDto;

    @ApiProperty({ example: '2025-09-20T07:48:09.000Z' })
    @Expose()
    createdAt: Date;
}

export class PaginatedGiftDto {
    @ApiProperty({ example: 20 })
    @Expose()
    totalItems: number;

    @ApiProperty({ example: 2 })
    @Expose()
    totalPages: number;

    @ApiProperty({ type: () => [GiftDto] })
    @Expose()
    @Type(() => GiftDto)
    data: GiftDto[];
}