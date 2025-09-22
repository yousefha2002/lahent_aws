import { Customer } from "src/modules/customer/entities/customer.entity";

export interface PaymentGateway {
    createPayment(
        amount: number, 
        currency: string, 
        callbackUrl: string,
        customer:Customer,
        card: {
            cardNumber: string;
            expiryMonth: number;
            expiryYear: number;
            cardHolderName: string;
            cvc: string;
            },
        description?:string);

    confirmPayment(orderId: string, gwayPaymentId: string, hash: string): Promise<boolean>;
}