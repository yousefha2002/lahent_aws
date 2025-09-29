import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SimpleCustomerDto } from 'src/modules/customer/dto/simple-customer.dto';
import { BaseloyaltyOfferDto } from 'src/modules/loyalty_offer/dto/loyalty-offer.dto';

export class RelatedStoreDto {
    @Expose()
    @ApiProperty({ example: 1, description: 'Store ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: 'My Store', description: 'Store name' })
    name: string;

    @Expose()
    @ApiProperty({ example: 'https://example.com/logo.png', description: 'Store logo URL' })
    logoUrl: string;
}

export class RelatedOrderDto {
    @Expose()
    @ApiProperty({ example: 123, description: 'Order ID' })
    id: number;

    @Expose()
    @Type(() => RelatedStoreDto)
    @ApiProperty({ type: RelatedStoreDto, description: 'Related store information' })
    store: RelatedStoreDto;
}

export class RelatedGiftDto {
    @Expose()
    @ApiProperty({ example: 456, description: 'Gift ID' })
    id: number;

    @Expose()
    @Type(() => SimpleCustomerDto)
    @ApiPropertyOptional({ type: SimpleCustomerDto, description: 'The other party involved in the gift' })
    otherParty?: SimpleCustomerDto;
}

export class TransactionDto {
    @Expose()
    @ApiProperty({ example: 789, description: 'Transaction ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: 'IN', description: 'Transaction direction (IN/OUT)' })
    direction: string;

    @Expose()
    @ApiProperty({ example: 'GIFT_RECEIVED', description: 'Transaction type' })
    type: string;

    @Expose()
    @ApiProperty({ example: 100, description: 'Transaction amount' })
    amount: number;

    @Expose()
    @Type(() => RelatedOrderDto)
    @ApiPropertyOptional({ type: RelatedOrderDto, description: 'Related order info if any' })
    order?: RelatedOrderDto;

    @Expose()
    @Type(() => RelatedGiftDto)
    @ApiPropertyOptional({ type: RelatedGiftDto, description: 'Related gift info if any' })
    gift?: RelatedGiftDto;

    @Expose()
    @Type(() => BaseloyaltyOfferDto)
    @ApiPropertyOptional({ type: BaseloyaltyOfferDto, description: 'Related loyalty offer info if any' })
    loyaltyOffer?: BaseloyaltyOfferDto;

    @Expose()
    @ApiProperty({ example: new Date(), description: 'Transaction creation date' })
    createdAt: Date;
}

export class PaginatedTransactionDto {
    @Expose()
    @ApiProperty({ example: 10, description: 'Total number of pages' })
    totalPages: number;

    @Expose()
    @ApiProperty({ example: 100, description: 'Total number of items' })
    totalItems: number;

    @Expose()
    @Type(() => TransactionDto)
    @ApiProperty({ type: [TransactionDto], description: 'Array of transaction items' })
    data: TransactionDto[];
}