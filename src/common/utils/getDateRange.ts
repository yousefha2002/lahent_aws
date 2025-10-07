export function getDateRange(filter?: string, specificDate?: string) {
    const now = new Date();
    let start: Date, end: Date;

    switch(filter) {
        case 'today':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            break;
        case 'week':
            const firstDayOfWeek = now.getDate() - now.getDay();
            start = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek + 6, 23, 59, 59, 999);
            break;
        case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'year':
            start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        case 'specific':
            if (!specificDate) throw new Error("Specific date required");
            const d = new Date(specificDate);
            start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
            end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
            break;
        default:
            start = new Date(0);
            end = new Date();
    }

    return { start, end };
}