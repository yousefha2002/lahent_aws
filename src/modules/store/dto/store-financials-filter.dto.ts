// dto/store-financials-filter.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class StoreFinancialsFilterDto {
    @ApiProperty({ 
        description: 'Filter type: today, week, month, year, all, specific', 
        example: 'month' 
    })
    @IsString()
    @IsOptional()
    filter: string;

    @ApiProperty({ 
        description: 'Specific date if filter = specific', 
        example: '2025-09-11', 
        required: false 
    })
    @IsOptional()
    @IsDateString()
    specificDate?: string;
}
