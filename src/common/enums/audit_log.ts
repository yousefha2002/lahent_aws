export enum AuditLogEntity {
    STORE = 'store',
    PRODUCT = 'product',
    CUSTOMER = 'customer',
    ORDER = 'order',
    OFFER = 'offer',
    VARIANT = 'variant',
    EXTRA = 'extra',
    INSTRUCTION = 'instruction',
    AVATAR = 'avatar',
    CARBRAND = 'carBrand',
    PRODUCTCATEGORY = 'productCategory',
    COUPON = 'coupon',
    GIFTCATEGORY = 'giftCategory',
    GIFTTEMPLATE = 'giftTemplate',
    LOYALTYOFFER ='loyaltyOffer',
    POINTSSYSTEM = 'pointsSystem',
    OWNER = 'owner',
    ROLE = 'role',
    SECTOR = 'sector',
    STORECOMMISSION = 'storeCommission',
    ADMIN = 'admin',
    TYPE = 'type',
    SUBTYPE = 'subtype',
    VARIANTCATEGORY = 'variantCategory'
}

export enum AuditLogAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
}