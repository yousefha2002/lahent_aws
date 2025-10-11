export const SMSMessages = {
    SEND_CODE: (code: string) => ({
        en: `Your OTP code is: ${code}`,
        ar: `رمز التحقق الخاص بك هو: ${code}`,
    }),
    STORE_APPROVED: () => ({
        en: `Your store has been approved. You can now access your account.`,
        ar: `تمت الموافقة على متجرك. يمكنك الآن الوصول إلى حسابك.`,
    }),
    GIFT_RECEIVED: (senderPhone: string, amount: number) => ({
        en: `You received a gift from ${senderPhone} worth ${amount}₪ 🎁`,
        ar: `وصلك هدية من الرقم ${senderPhone} بقيمة ${amount}₪ 🎁`,
    }),
};