interface OrderNotificationInput {
    orderId: number;
    customerId?: number;
    storeId?: number;
    status: string;
}