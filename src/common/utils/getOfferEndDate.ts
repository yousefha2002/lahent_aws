import { DurationUnit } from "../enums/dauration_unit";

export function getOfferEndDate(startDate: Date, unit: DurationUnit, duration: number): Date {
    const start = new Date(startDate);
    return unit === DurationUnit.DAYS
      ? new Date(start.getTime() + duration * 24 * 60 * 60 * 1000)
      : new Date(start.getTime() + duration * 60 * 60 * 1000);
}