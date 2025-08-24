import { BadRequestException } from '@nestjs/common';

export interface VariantLanguageDto {
    languageCode: string;
    name: string;
}

export interface VariantDto {
    additional_price: number;
    categoryId: number;
    languages: VariantLanguageDto[];
}

export function validateAndParseVariants(raw: string): VariantDto[] {
    let parsed: any[];

    try {
        const cleaned = raw.trim();
        parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new BadRequestException('Variants must be a non-empty array.');
        }
    } catch {
        throw new BadRequestException('Variants must be a valid JSON string.');
    }

    parsed.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
        throw new BadRequestException(`Variant at index ${index} must be an object.`);
        }

        const { additional_price, categoryId, languages } = item;

        // ✅ تحقق من additional_price
        if (typeof additional_price !== 'number' || isNaN(additional_price)) {
        throw new BadRequestException(
            `"additional_price" at index ${index} must be a valid number.`
        );
        }

        // ✅ تحقق من categoryId
        if (typeof categoryId !== 'number' || isNaN(categoryId)) {
        throw new BadRequestException(
            `"categoryId" at index ${index} must be a valid number.`
        );
        }

        // ✅ تحقق من languages
        if (!Array.isArray(languages) || languages.length === 0) {
        throw new BadRequestException(
            `"languages" at index ${index} must be a non-empty array.`
        );
        }

        languages.forEach((lang, langIndex) => {
        if (typeof lang !== 'object' || lang === null) {
            throw new BadRequestException(
            `Language at variant[${index}].languages[${langIndex}] must be an object.`
            );
        }

        const { languageCode, name } = lang;

        if (typeof languageCode !== 'string' || !['en', 'ar'].includes(languageCode)) {
            throw new BadRequestException(
            `"languageCode" at variant[${index}].languages[${langIndex}] must be 'en' or 'ar'.`
            );
        }

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadRequestException(
            `"name" at variant[${index}].languages[${langIndex}] must be a non-empty string.`
            );
        }

        lang.name = name.trim();
        });

        // ✅ تحقق من تكرار اللغة داخل نفس الفاريانت
        const languagesCodes = languages.map((l) => l.languageCode);
        const unique = new Set(languagesCodes);
        if (unique.size !== languagesCodes.length) {
        throw new BadRequestException(
            `Duplicate languages are not allowed in variant at index ${index}.`
        );
        }
    });

    return parsed as VariantDto[];
}
