export const GiftNotifications = {
    // لما المستخدم يستلم هدية جديدة
    GIFT_RECEIVED: (amount: number) => ({
        en: `You’ve received a gift of ${amount} points 🎁.`,
        ar: `لقد استلمت هدية بقيمة ${amount} نقطة 🎁.`,
    }),

    // لما المستلم يقبل الهدية
    GIFT_ACCEPTED: (name: string) => ({
        en: `${name} has accepted your gift 🎉.`,
        ar: `${name} قبل هديتك 🎉.`,
    }),

    // لما المستلم يشكر المرسل على الهدية — الإشعار يذهب للمرسل
    GIFT_THANKED: (name: string) => ({
        en: `${name} thanked you for your gift 💌.`,
        ar: `${name} شكرك على هديتك 💌.`,
    }),
};