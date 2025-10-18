export function normalizeDatesForAudit(entity: any) {
    if (!entity || typeof entity !== 'object') return entity;

    const copy = { ...entity };

    for (const key of Object.keys(copy)) {
        const value = copy[key];
        if (value instanceof Date) {
        copy[key] = value.toISOString();
        }
    }

    return copy;
}