import { DurationUnit } from 'src/common/enums/dauration_unit';

export function isOfferActive(
  date: Date,
  durationUnit: DurationUnit,
  duration: number,
): boolean {
  const startDate = new Date(date);
  let endDate = new Date(startDate.getTime()); // نسخة من تاريخ البداية

  switch (durationUnit) {
    case DurationUnit.DAYS:
      endDate.setDate(endDate.getDate() + duration);
      break;
    case DurationUnit.HOURS:
      endDate.setHours(endDate.getHours() + duration);
      break;
    default:
      throw new Error('Invalid duration unit');
  }

  return new Date() < endDate;
}