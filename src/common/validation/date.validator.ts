import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Language } from '../enums/language';

interface DateValidationResult {
    startDate: Date;
    endDate: Date | null;
}

interface ValidateDateOptions {
    existingStart?: Date;
    existingEnd?: Date | null;
    newStart?: string | Date | null;
    newEnd?: string | Date | null;
    i18n: I18nService;
    lang: Language;
}

export function validateDates({
    existingStart,
    existingEnd,
    newStart,
    newEnd,
    i18n,
    lang,
}: ValidateDateOptions): DateValidationResult {
    const now = new Date();

    // ======== معالجة startDate ========
    let startDate = existingStart ?? now;
    if (newStart !== undefined && (!existingStart || existingStart > now)) {
        if (newStart === null) {
        startDate = now;
        } else {
        const tempStart = new Date(newStart);
        if (isNaN(tempStart.getTime())) {
            throw new BadRequestException(
            i18n.translate('translation.invalid_dates', { lang })
            );
        }
        if (tempStart < now) {
            throw new BadRequestException(
            i18n.translate('translation.start_in_past', { lang })
            );
        }
        startDate = tempStart;
        }
    }
    // إذا العرض بدأ، startDate تبقى كما هي

    // ======== معالجة endDate ========
    let endDate = existingEnd ?? null;
    if (newEnd !== undefined) {
        if (newEnd === null) {
        endDate = null;
        } else {
        const tempEnd = new Date(newEnd);
        if (isNaN(tempEnd.getTime())) {
            throw new BadRequestException(
            i18n.translate('translation.invalid_dates', { lang })
            );
        }
        if (tempEnd < now) {
            throw new BadRequestException(
            i18n.translate('translation.expired_date', { lang })
            );
        }
        endDate = tempEnd;
        }
    }

    // ======== تحقق التواريخ ========
    if (endDate && startDate >= endDate) {
        throw new BadRequestException(
        i18n.translate('translation.invalid_dates', { lang })
        );
    }

    return { startDate, endDate };
}