import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Language } from '../enums/language';

interface DateValidationResult {
    startDate: Date;
    endDate: Date | null;
}

interface ValidateCreateDateOptions {
    start?: string | Date | null;
    end?: string | Date | null;
    i18n: I18nService;
    lang: Language;
}

export function validateCreateDates({
    start,
    end,
    i18n,
    lang,
}: ValidateCreateDateOptions): DateValidationResult {
    const now = new Date();

    // ======== معالجة startDate ========
    const startDate = start ? new Date(start) : now;
    if (isNaN(startDate.getTime())) {
        throw new BadRequestException(i18n.translate('translation.invalid_dates', { lang }));
    }
    if (startDate < now) {
        throw new BadRequestException(i18n.translate('translation.start_in_past', { lang }));
    }

    // ======== معالجة endDate ========
    let endDate: Date | null = null;
    if (end) {
        endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
            throw new BadRequestException(i18n.translate('translation.invalid_dates', { lang }));
        }
        if (endDate < startDate) {
            throw new BadRequestException(i18n.translate('translation.invalid_dates', { lang }));
        }
        if (endDate < now) {
            throw new BadRequestException(i18n.translate('translation.expired_date', { lang }));
        }
    }

    return { startDate, endDate };
}
