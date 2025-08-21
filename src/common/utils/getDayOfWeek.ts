import { DayOfWeek } from 'src/common/enums/day_of_week';

export function getDayOfWeek(date?: Date): DayOfWeek {
  const d = date ?? new Date(); // إذا ما أعطيت تاريخ استخدم الحالي
  const dayOfWeekStr = d
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toUpperCase() as keyof typeof DayOfWeek;

  return DayOfWeek[dayOfWeekStr];
}