import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoyaltySettingDto {
    @Expose()
    @ApiProperty({ description: 'عدد النقاط المكتسبة لكل ريال' })
    pointsPerCurrency: number;

    @Expose()
    @ApiProperty({ description: 'قيمة النقطة عند الاستعمال للخصم' })
    currencyPerPoint: number;

    @Expose()
    @ApiProperty({ description: 'عدد النقاط المكتسبة عند قبول الدعوة' })
    pointsPerInviteAcceptance: number; 
}