import { Expose } from 'class-transformer';

export class CouponDto {
    @Expose()
    id: number;

    @Expose()
    code: string;

    @Expose()
    discountPercentage: number;

    @Expose()
    maxUsage: number;

    @Expose()
    usedCount: number;

    @Expose()
    expiryDate: Date;

    @Expose()
    isActive: boolean;
}
