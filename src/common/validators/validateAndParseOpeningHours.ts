import { BadRequestException } from '@nestjs/common';

export interface OpeningHourEnum {
  day: string;
  openTime: string | null;
  closeTime: string | null;
}

export enum DayOfWeek {
  SUN = 'sun',
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
}

export function validateAndParseOpeningHours(raw: string): OpeningHourEnum[] {
  let parsed: any[];

  try {
    const cleaned = raw.trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new BadRequestException('openingHours must be a valid JSON string.');
  }

  if (!Array.isArray(parsed)) {
    throw new BadRequestException('openingHours must be an array.');
  }

  parsed.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new BadRequestException(
        `Item at index ${index} must be an object.`,
      );
    }

    const { day } = item;
    let { openTime, closeTime } = item;

    if (
      typeof day !== 'string' ||
      !Object.values(DayOfWeek).includes(day as DayOfWeek)
    ) {
      throw new BadRequestException(
        `"day" at index ${index} must be one of: ${Object.values(DayOfWeek).join(', ')}`,
      );
    }

    const isOpenEmpty = isEmpty(openTime);
    const isCloseEmpty = isEmpty(closeTime);

    // ✅ إذا واحدة منهم null، خلي التانية كمان null
    if (isOpenEmpty || isCloseEmpty) {
      openTime = null;
      closeTime = null;
    }

    if (openTime !== null && !isValidTimeFormat(openTime)) {
      throw new BadRequestException(
        `"openTime" at index ${index} must be in HH:mm format.`,
      );
    }

    if (closeTime !== null && !isValidTimeFormat(closeTime)) {
      throw new BadRequestException(
        `"closeTime" at index ${index} must be in HH:mm format.`,
      );
    }

    // ✅ احفظ القيم بعد التعديل
    item.openTime = openTime;
    item.closeTime = closeTime;
  });

  if (parsed.length !== 7) {
    throw new BadRequestException('Opining hours should include each days');
  }
  return parsed as OpeningHourEnum[];
}

function isValidTimeFormat(time: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(time);
}

function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === '';
}
