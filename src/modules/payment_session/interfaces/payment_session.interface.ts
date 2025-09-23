import { CardForApi } from "src/common/types/cardForApi";
import { Customer } from "src/modules/customer/entities/customer.entity";

export interface PaymentGateway {
    createPayment(
        amount: number, 
        currency: string, 
        callbackUrl: string,
        customer:Customer,
        card: CardForApi,
        description?:string);

    confirmPayment(orderId: string, gwayPaymentId: string, hash: string): Promise<boolean>;
}