export const GiftNotifications = {
    GIFT_RECEIVED: {
        title: {
        en: 'You Received a Gift 🎁',
        ar: 'لقد استلمت هدية 🎁',
        },
        body: {
        en: (amount: number) => `You received ${amount} points.`,
        ar: (amount: number) => `لقد استلمت ${amount} نقطة.`,
        },
    },
};