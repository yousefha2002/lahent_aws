export const OrderNotifications = {
    NEW_ORDER: {
        title: {
            en: 'New Order Received',
            ar: 'تم استلام طلب جديد',
        },
        body: {
            en: (customerName: string) => `A customer ${customerName} has placed a new order.`,
            ar: (customerName: string) => `قام الزبون ${customerName} بعمل طلب جديد.`,
        },
    },
};