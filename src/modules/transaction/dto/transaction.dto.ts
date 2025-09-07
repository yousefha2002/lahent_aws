import { Expose, Type } from 'class-transformer';
import { SimpleCustomerDto } from 'src/modules/customer/dto/simple-customer.dto';
import { BaseloyaltyOfferDto } from 'src/modules/loyalty_offer/dto/loyalty-offer.dto';

export class RelatedStoreDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    logoUrl: string;
}

export class RelatedOrderDto {
    @Expose()
    id: number;

    @Expose()
    @Type(() => RelatedStoreDto)
    store: RelatedStoreDto;
}

export class RelatedGiftDto {
    @Expose()
    id: number;

    @Expose()
    receiverName: string;

    @Expose()
    receiverPhone: string;

    @Expose()
    @Type(() => SimpleCustomerDto)
    otherParty?: SimpleCustomerDto;
}


export class TransactionDto {
    @Expose()
    id: number;

    @Expose()
    direction: string;

    @Expose()
    type: string;

    @Expose()
    amount: number;

    @Expose()
    @Type(() => RelatedOrderDto)
    order?: RelatedOrderDto;

    @Expose()
    @Type(() => RelatedGiftDto)
    gift?: RelatedGiftDto;

    @Expose()
    @Type(() => BaseloyaltyOfferDto)
    loyaltyOffer?: BaseloyaltyOfferDto;

    @Expose()
    createdAt: Date;
}

export class PaginatedTransactionDto {
    @Expose()
    totalPages: number;

    @Expose()
    totalItems: number;

    @Expose()
    @Type(() => TransactionDto)
    data: TransactionDto[];
}