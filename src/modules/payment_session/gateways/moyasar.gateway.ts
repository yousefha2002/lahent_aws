import { PaymentGateway } from "../interfaces/payment_session.interface";

export class MoyasarGateway implements PaymentGateway {
    async createPayment(amount: number, currency: string, callbackUrl: string) {
        console.log(`[Moyasar] Creating payment for ${amount} ${currency}`);
        // هنا من المفترض استدعاء API البوابة
        return {
        checkoutUrl: 'https://moyasar.com/checkout/123',
        sessionId: 'moyasar_tx_123'
        };
    }

    async verifyPayment(sessionId: string) {
        console.log(`[Moyasar] Verifying transaction ${sessionId}`);
        // من المفترض استدعاء API البوابة للتحقق
        return {
        success: true,
        amount: 100
        };
    }
}
