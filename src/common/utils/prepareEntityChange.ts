import { buildMultiLangEntity } from "./buildMultiLangEntity";

export function prepareEntityChange({
    oldEntity,
    newEntity,
    oldLanguages,
    newLanguages,
    fields,
}: {
    oldEntity?: any;
    newEntity?: any;
    oldLanguages?: any[];
    newLanguages?: any[];
    fields?: string[];
}) {
    const processLanguages = (langs?: any[]) => {
        if (!langs || langs.length === 0) return {};
        const flds = fields && fields.length
        ? fields
        : Object.keys(langs[0]).filter(k => k !== 'languageCode');
        return buildMultiLangEntity(langs, flds);
    };

    const oldLangData = processLanguages(oldLanguages);
    const newLangData = processLanguages(newLanguages);

    // دمج الكائنات العادية مع اللغات
    const finalOldEntity = { ...oldEntity, ...oldLangData };
    const finalNewEntity = { ...newEntity, ...newLangData };

    return { oldEntity: finalOldEntity, newEntity: finalNewEntity };
}
