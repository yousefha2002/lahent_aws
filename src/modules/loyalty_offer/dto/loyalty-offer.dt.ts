import { Expose, Transform } from "class-transformer";

export class BaseloyaltyOfferDto{
    @Expose()
    id:number

    @Expose()
    amountRequired:number

    @Expose()
    bonusAmount:number
}

export class ExtendedLoyaltyOfferDto extends BaseloyaltyOfferDto {
    @Expose()
    isActive: boolean;

    @Transform(({ value }) => value ?? null)
    @Expose()
    startDate: Date;

    @Expose()
    @Transform(({ value }) => value ?? null)
    endDate: Date;
}