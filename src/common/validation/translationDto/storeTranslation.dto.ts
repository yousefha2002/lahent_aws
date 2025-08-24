import { BadRequestException } from '@nestjs/common';

export interface StoreTranslationDto {
    languageCode: string;
    name: string;
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

        const { languageCode, name } = item;

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
    });

    // Optional: تحقق إن كل لغة موجودة مرة واحدة فقط
    const languages = parsed.map((t) => t.languageCode);
    const uniqueLanguages = new Set(languages);
    if (languages.length !== uniqueLanguages.size) {
        throw new BadRequestException('Duplicate languages are not allowed in translations.');
    }

    return parsed as StoreTranslationDto[];
}