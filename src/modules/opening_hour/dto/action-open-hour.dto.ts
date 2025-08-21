import { DayOfWeek } from 'src/common/enums/day_of_week';

import { IsEnum, IsMilitaryTime, IsOptional, IsString } from 'class-validator';

export class ActionOpeningHourDto {
    @IsEnum(DayOfWeek)
    day: DayOfWeek;

    @IsOptional()
    @IsString()
    @IsMilitaryTime()
    openTime?: string;

    @IsOptional()
    @IsString()
    @IsMilitaryTime()
    closeTime?: string;
}
