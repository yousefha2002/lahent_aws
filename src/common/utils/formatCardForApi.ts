import { PaymentCard } from "src/modules/payment_card/entities/payment_card.entity";

export function formatCardForApi(card: PaymentCard) {
    const [year, month] = card.expiryDate.split('-');
    return {
        cardNumber: card.cardNumber,
        cardHolderName: card.cardHolderName,
        expiryMonth: month.padStart(2, '0'), // "01", "12"
        expiryYear: year,
    };
}