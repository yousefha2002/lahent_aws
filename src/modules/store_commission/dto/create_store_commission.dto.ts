import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateStoreCommissionDto {
    @IsNotEmpty()
    @IsNumber()
    storeId: number;

    @IsNotEmpty()
    @IsNumber()
    commissionPercent: number;
}