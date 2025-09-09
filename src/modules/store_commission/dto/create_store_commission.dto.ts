import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreCommissionDto {
    @ApiProperty({ 
        description: 'The ID of the store for which the commission is being created', 
        example: 1 
    })
    @IsNotEmpty()
    @IsNumber()
    storeId: number;

    @ApiProperty({ 
        description: 'The commission percentage for the store', 
        example: 10 
    })
    @IsNotEmpty()
    @IsNumber()
    commissionPercent: number;
}