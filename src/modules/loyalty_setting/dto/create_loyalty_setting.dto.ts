import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoyaltySettingDto {
    @ApiProperty({ description: 'عدد النقاط المكتسبة لكل ريال', example: 0.02 })
    @IsNumber()
    @Min(0)
    pointsPerCurrency: number;

    @ApiProperty({ description: 'قيمة النقطة عند الاستعمال للخصم', example: 0.05 })
    @IsNumber()
    @Min(0)
    currencyPerPoint: number;
}