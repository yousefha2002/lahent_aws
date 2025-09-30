import { BadRequestException } from '@nestjs/common';
import { validateRequiredLanguages } from './translation-validator.';

export interface StoreTranslationDto {
    languageCode: string;
    name: string;
    brand?: string
}

export function validateAndParseStoreTranslations(raw: string): StoreTranslationDto[] {
    let parsed: any[];

    try {
        const cleaned = raw.trim();
        parsed = JSON.parse(cleaned);
        if (parsed.length === 0) {
            throw new BadRequestException('At least one translation is required.');
        }
    } catch {
        throw new BadRequestException('Translations must be a valid JSON string.');
    }

    if (!Array.isArray(parsed)) {
        throw new BadRequestException('Translations must be an array.');
    }

    parsed.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
        throw new BadRequestException(`Item at index ${index} must be an object.`);
        }

        const { languageCode, name,brand } = item;

        if (typeof languageCode !== 'string' || !['en', 'ar'].includes(languageCode)) {
        throw new BadRequestException(
            `"language" at index ${index} must be 'en' or 'ar'.`
        );
        }

        if (typeof name !== 'string' || name.trim() === '') {
        throw new BadRequestException(
            `"name" at index ${index} must be a non-empty string.`
        );
        }

        // ✅ احفظ الاسم بعد التعديل (trim)
        item.name = name.trim();

        if (brand !== undefined && typeof brand !== 'string') {
        throw new BadRequestException(
        `"brand" at index ${index} must be a string if provided.`
        );
    }
    });

    const languages = parsed.map((t) => t.languageCode);
    validateRequiredLanguages(languages, 'translations');

    return parsed as StoreTranslationDto[];
}