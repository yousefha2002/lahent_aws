import { BadRequestException } from '@nestjs/common';

export function validateUniqueLanguages(codes: string[], context: string = 'languages') {
    const unique = new Set(codes);
    if (codes.length !== unique.size) {
        throw new BadRequestException(`Duplicate languages are not allowed in ${context}.`);
    }
}

export function validateRequiredLanguages(codes: string[], context: string = 'translations') {
    validateUniqueLanguages(codes, context);
    const required = ['en', 'ar'];
    for (const lang of required) {
        if (!codes.includes(lang)) {
        throw new BadRequestException(
            `${context} must include both 'en' and 'ar' translations.`
        );
        }
    }
}