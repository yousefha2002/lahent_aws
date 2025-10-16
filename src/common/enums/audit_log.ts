export enum AuditLogEntity {
    STORE = 'store',
    PRODUCT = 'product',
    CUSTOMER = 'customer',
    ORDER = 'order',
    OFFER = 'offer',
    VARIANT = 'variant',
    EXTRA = 'extra',
    INSTRUCTION = 'instruction',
    AVATAR = 'avatar'
}

export enum AuditLogAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
}