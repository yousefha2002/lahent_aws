import { DayOfWeek } from 'src/common/enums/day_of_week';
import { IsEnum, IsMilitaryTime, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActionOpeningHourDto {
    @ApiProperty({ enum: DayOfWeek, example: 'mon' })
    @IsEnum(DayOfWeek)
    day: DayOfWeek;

    @ApiProperty({ example: '08:00', required: false })
    @IsOptional()
    @IsString()
    @IsMilitaryTime()
    openTime?: string;

    @ApiProperty({ example: '18:00', required: false })
    @IsOptional()
    @IsString()
    @IsMilitaryTime()
    closeTime?: string;
}