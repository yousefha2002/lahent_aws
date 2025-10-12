import { CardForApi } from "src/common/types/cardForApi";
import { Customer } from "src/modules/customer/entities/customer.entity";
import { ApplePayPaymentDTO } from "../dto/apple-payment.dto";

export interface PaymentGateway {
    createPayment(
        amount: number, 
        currency: string, 
        callbackUrl: string,
        customer:Customer,
        card: CardForApi,
        description?:string);

    confirmPayment(orderId: string, gwayPaymentId: string, hash: string): Promise<boolean>;

    createApplePayPayment(amount: number, currency: string, callbackUrl: string,customer:Customer,applePayData: ApplePayPaymentDTO);
}