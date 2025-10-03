import { PickupType } from "src/common/enums/pickedup_type";
import { PickupTypeLabels } from "../pickuptypelables";

export const OrderNotifications = {
    NEW_ORDER: (orderNumber: number) => ({
        en: `New Order #${orderNumber} received.`,
        ar: `تم استلام الطلب رقم #${orderNumber}.`,
    }),
    ACCEPTED_BY_STORE: (orderNumber: number) => ({
        en: `Order #${orderNumber} accepted — preparing your order.`,
        ar: `تم قبول الطلب رقم #${orderNumber} — في انتظار تجهيز الطلب.`,
    }),
    REJECTED_BY_STORE: (orderNumber: number) => ({
        en: `Order #${orderNumber} has been rejected by the store.`,
        ar: `تم رفض الطلب رقم #${orderNumber} من قبل المتجر.`,
    }),
    PREPARING: (orderNumber: number) => ({
        en: `Order #${orderNumber} is now being prepared.`,
        ar: `بدأ تحضير الطلب رقم #${orderNumber}.`,
    }),
    HALF_PREPARING: (orderNumber: number) => ({
        en: `Order #${orderNumber} is halfway prepared.`,
        ar: `مر نصف وقت تجهيز الطلب رقم #${orderNumber}.`,
    }),
    ORDER_READY: (orderNumber: number, pickupType: PickupType) => ({
        en: `Order #${orderNumber} is ready for pickup: ${PickupTypeLabels[pickupType].en}.`,
        ar: `طلبك رقم #${orderNumber} جاهز للاستلام ${PickupTypeLabels[pickupType].ar}.`
    }),
    ORDER_CANCELLED: (orderNumber: number) => ({
        en: `Order #${orderNumber} has been cancelled and payment refunded.`,
        ar: `تم إلغاء الطلب رقم #${orderNumber} واسترداد المبلغ.`,
    }),
    ORDER_EXPIRED_PAYMENT: (orderNumber: number) => ({
        en: `Order #${orderNumber} expired due to non-payment.`,
        ar: `انتهت صلاحية الطلب رقم #${orderNumber} لعدم الدفع.`,
    }),
    CUSTOMER_DECISION: (orderNumber: number) => ({
        en: `Order #${orderNumber} is pending your decision — the store has not confirmed yet.`,
        ar: `الطلب رقم #${orderNumber} في انتظار قرارك — المتجر لم يؤكد بعد.`,
    }),
    CUSTOMER_ON_THE_WAY: (orderNumber: number) => ({
        en: `Customer is on the way for order #${orderNumber}.`,
        ar: `الزبون في الطريق للطلب رقم #${orderNumber}.`,
    }),
    ORDER_ARRIVED: (orderNumber: number) => ({
        en: `Order #${orderNumber} customer has arrived.`,
        ar: `وصل الزبون لاستلام الطلب رقم #${orderNumber}.`,
    }),
    ORDER_RECEIVED: (orderNumber: number) => ({
        en: `Order #${orderNumber} has been received by the customer.`,
        ar: `تم استلام الطلب رقم #${orderNumber} من الزبون.`,
    }),
};