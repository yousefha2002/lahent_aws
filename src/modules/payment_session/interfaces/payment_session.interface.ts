import { Customer } from "src/modules/customer/entities/customer.entity";

export interface PaymentGateway {
    createPayment(amount: number, currency: string, callbackUrl: string,customer:Customer,description?:string);
    verifyPayment(sessionId: string);
}