import { BadRequestException } from '@nestjs/common';
import { Language } from '../enums/language';

export interface VariantLanguageDto {
    languageCode: Language;
    name: string;
}

export function validateVariantLanguages(raw: string | VariantLanguageDto[]): VariantLanguageDto[] {
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

        const { languageCode, name } = lang;

        if (!Object.values(Language).includes(languageCode)) {
        throw new BadRequestException(
            `"languageCode" at index ${index} must be one of: ${Object.values(Language).join(', ')}`
        );
        }

        if (typeof name !== 'string' || name.trim() === '') {
        throw new BadRequestException(
            `"name" at index ${index} must be a non-empty string`
        );
        }

        lang.name = name.trim();
    });

    const codes = parsed.map(l => l.languageCode);
    const unique = new Set(codes);
    if (codes.length !== unique.size) {
        throw new BadRequestException('Duplicate languages are not allowed');
    }

    return parsed as VariantLanguageDto[];
}