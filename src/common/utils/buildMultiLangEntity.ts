export function buildMultiLangEntity(languages: any[], fields: string[]) {
    const entity: any = { translations: {} };

    for (const langObj of languages) {
        const code = langObj.languageCode;
        entity.translations[code] = {};

        for (const field of fields) {
        entity.translations[code][field] = langObj[field];
        }
    }

    return entity;
}