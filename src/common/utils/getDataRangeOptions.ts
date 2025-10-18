import { getDateRange } from "./getDateRange";

export interface DateRangeOptions {filter?: string;specificDate?: string;from?: string;to?: string;}

export function getEffectiveDateRange(options: DateRangeOptions): { start: Date; end: Date } {
    const { filter, specificDate, from, to } = options;

    if (from && to) {
        return {
            start: new Date(from),
            end: new Date(to)
        };
    }

    const range = getDateRange(filter, specificDate);
    return {
        start: range.start,
        end: range.end
    };
}