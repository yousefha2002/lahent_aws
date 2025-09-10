export enum OrderStatus {
    PENDING_PAYMENT = 'pending_payment',
    PENDING_CONFIRMATION = 'pending_confirmation',
    CUSTOMER_DECISION = 'customer_decision',
    CANCELLED = 'cancelled',
    SCHEDULED = 'scheduled',
    PREPARING = 'preparing',
    HALF_PREPARATION = 'half_preparation',
    READY = 'ready',
    ARRIVED = 'arrived',
    RECEIVED = 'received',
    REJECTED = 'rejected',
    EXPIRED="expired"
}