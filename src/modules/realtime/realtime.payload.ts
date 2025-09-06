export interface OrderUpdatePayload {
    orderId: number;
    status?: string;       // الحالة الجديدة
    meta?: Record<string, any>; // أي بيانات إضافية
}