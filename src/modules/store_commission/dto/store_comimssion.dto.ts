import { Expose } from 'class-transformer';

export class StoreCommissionDto {
    @Expose()
    id: number;

    @Expose()
    storeId: number;

    @Expose()
    commissionPercent: number;
}