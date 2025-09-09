import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoyaltySettingDto {
    @Expose()
    @ApiProperty({ description: 'عدد النقاط المكتسبة لكل ريال' })
    pointsPerDollar: number;

    @Expose()
    @ApiProperty({ description: 'قيمة النقطة عند الاستعمال للخصم' })
    dollarPerPoint: number;
}