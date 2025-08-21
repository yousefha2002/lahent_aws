import { OrderStatus } from "../enums/order_status";

export function getOrderDate(obj: any): Date {
    switch (obj.status) {
        case OrderStatus.PENDING_CONFIRMATION:
        case OrderStatus.CUSTOMER_DECISION:
            return obj.paidAt;
        case OrderStatus.PLACED:
            return obj.placedAt;
        case OrderStatus.CANCELLED:
        case OrderStatus.REJECTED:
        case OrderStatus.EXPIRED:
            return obj.canceledAt;
        case OrderStatus.PREPARING:
        case OrderStatus.HALF_PREPARATION:
            return obj.preparedAt;
        case OrderStatus.READY:
            return obj.readyAt;
        case OrderStatus.ARRIVED:
            return obj.arrivedAt;
        case OrderStatus.RECEIVED:
            return obj.receivedAt;
        default:
            return obj.createdAt;
    }
}