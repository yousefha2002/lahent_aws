import { BadRequestException } from '@nestjs/common';
import { Language } from '../enums/language';
import { validateRequiredLanguages } from '../utils/validateLanguages';

export interface ProductLanguageDto {
    languageCode: Language;
    name: string;
    shortDescription: string;
    longDescription: string;
}

export function validateProductLanguages(raw: string | ProductLanguageDto[],): ProductLanguageDto[] {
    let parsed: any[];

    if (typeof raw === 'string') {
        try {
        parsed = JSON.parse(raw.trim());
        } catch {
        throw new BadRequestException('Languages must be a valid JSON string');
        }
    } else if (Array.isArray(raw)) {
        parsed = raw;
    } else {
        throw new BadRequestException('Languages must be an array or JSON string');
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new BadRequestException('At least one language is required');
    }

    parsed.forEach((lang, index) => {
        if (typeof lang !== 'object' || lang === null) {
        throw new BadRequestException(`Language at index ${index} must be an object`);
        }

        const { languageCode, name, shortDescription, longDescription } = lang;

        if (!Object.values(Language).includes(languageCode)) {
        throw new BadRequestException(
            `"languageCode" at index ${index} must be one of: ${Object.values(Language).join(', ')}`
        );
        }

        if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new BadRequestException(`"name" at index ${index} must be a non-empty string`);
        }

        if (!shortDescription || typeof shortDescription !== 'string' || shortDescription.trim() === '') {
        throw new BadRequestException(`"shortDescription" at index ${index} must be a non-empty string`);
        }

        if (!longDescription || typeof longDescription !== 'string' || longDescription.trim() === '') {
        throw new BadRequestException(`"longDescription" at index ${index} must be a non-empty string`);
        }

        // تنظيف المسافات
        lang.name = name.trim();
        lang.shortDescription = shortDescription.trim();
        lang.longDescription = longDescription.trim();
    });

    // التأكد من عدم تكرار اللغة
    const codes = parsed.map(l => l.languageCode);
    validateRequiredLanguages(codes, 'product languages')

    return parsed as ProductLanguageDto[];
}