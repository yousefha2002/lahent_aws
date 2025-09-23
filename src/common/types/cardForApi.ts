export type CardForApi = {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string; // "01", "12"
    expiryYear: string;  // "2026"
    cvc: string;
};