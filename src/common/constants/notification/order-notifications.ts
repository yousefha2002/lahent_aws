import { OrderStatus } from "../../enums/order_status";

export const OrderNotifications = {
    NEW_ORDER: {
        title: {
            en: 'New Order Received',
            ar: 'تم استلام طلب جديد',
        },
        body: {
            en: 'A new order has been placed.',
            ar: 'تم عمل طلب جديد.',
        },
    },
    ACCEPTED_BY_STORE: {
        title: {
            en: 'Your Order is Accepted',
            ar: 'تم قبول طلبك',
        },
        body: {
            en: 'Your order has been accepted.',
            ar: 'تم قبول طلبك.',
        },
    },
    REJECTED_BY_STORE: {
        title: {
            en: 'Your Order is Rejected',
            ar: 'تم رفض طلبك',
        },
        body: {
            en: 'Your order has been rejected.',
            ar: 'تم رفض طلبك.',
        }
    },
    ORDER_READY: {
        title: {
            en: 'Your Order is Ready',
            ar: 'طلبك جاهز',
        },
        body: {
            en: 'Your order is ready for pickup/delivery.',
            ar: 'طلبك جاهز للاستلام/التوصيل.',
        }
    },
    ORDER_ARRIVED: {
        title: {
            en: 'Customer Arrived',
            ar: 'وصل الزبون',
        },
        body: {
            en: 'The customer has arrived to pick up the order.',
            ar: 'وصل الزبون لاستلام الطلب.',
        }
    },
    ORDER_RECEIVED: {
        title: {
            en: 'Order Received',
            ar: 'تم استلام الطلب',
        },
        body: {
            en: 'The customer has confirmed receiving the order.',
            ar: 'قام الزبون بتأكيد استلام الطلب.',
        }
    },
    ORDER_EXPIRED_PAYMENT: {
        title: {
            en: 'Order Expired',
            ar: 'انتهت صلاحية الطلب',
        },
        body: {
            en: 'Your order has expired due to non-payment.',
            ar: 'انتهت صلاحية طلبك لعدم الدفع.',
        }
    },
    ORDER_PENDING_CONFIRMATION: {
        title: {
            en: 'Order Confirmation Update',
            ar: 'تحديث تأكيد الطلب',
        },
        body: {
            en: 'The store has not confirmed your order yet. Your decision is now required.',
            ar: 'المتجر لم يؤكد طلبك بعد. يجب اتخاذ قرارك الآن.',
        }
    },
    ORDER_CANCELLED: {
        title: {
            en: 'Order Cancelled',
            ar: 'تم إلغاء الطلب',
        },
        body: {
            en: 'The order has been cancelled and the payment refunded.',
            ar: 'تم إلغاء الطلب واسترداد المبلغ.',
        }
    },
    ORDER_STATUS_UPDATE: {
        title: {
            en: 'Order Status Update',
            ar: 'تحديث حالة الطلب',
        },
        body: {
            en: (status: OrderStatus) => `Your order status is now ${status}.`,
            ar: (status: OrderStatus) => `حالة طلبك الآن: ${status}.`,
        }
    },
    CUSTOMER_ON_THE_WAY: {
        title: {
            en: 'Customer On The Way',
            ar: 'الزبون في الطريق',
        },
        body: {
            en: (orderId: number) => `Customer is on the way for order #${orderId}.`,
            ar: (orderId: number) => `الزبون في الطريق للطلب رقم ${orderId}.`,
        }
    },
};
