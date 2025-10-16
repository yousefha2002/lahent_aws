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
    if (oldLanguages && newLanguages) {
        const oldData = buildMultiLangEntity(oldLanguages, fields || ['name']);
        const newData = buildMultiLangEntity(newLanguages, fields || ['name']);
        return { oldEntity: oldData, newEntity: newData };
    }

    return { oldEntity, newEntity };
}