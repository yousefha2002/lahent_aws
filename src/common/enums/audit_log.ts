export enum AuditLogEntity {
    STORE = 'store',
    PRODUCT = 'product',
    CUSTOMER = 'customer',
    ORDER = 'order',
    OFFER = 'offer',
    VARIANT = 'variant',
    EXTRA = 'extra',
    INSTRUCTION = 'instruction'
}

export enum AuditLogAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
}