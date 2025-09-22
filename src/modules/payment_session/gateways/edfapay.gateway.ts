import { PaymentGateway } from "../interfaces/payment_session.interface";
import axios from "axios";
import { generateCardHash } from "src/common/utils/generateHash";
import { Customer } from "src/modules/customer/entities/customer.entity";
import * as NodeFormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';


export class EdFapayGateway implements PaymentGateway {
    private apiUrl: string;
    private merchantId: string;
    private secretKey: string;
    private statusUrl: string;
    constructor() {
        if (!process.env.EDFA_API_URL || !process.env.EDFA_MERCHANT_ID || !process.env.EDFA_SECRET_KEY || !process.env.EDFA_STATUS_URL) {
            throw new Error('EDFAPAY environment variables are missing');
        }
        this.apiUrl = process.env.EDFA_API_URL;
        this.merchantId = process.env.EDFA_MERCHANT_ID;
        this.secretKey = process.env.EDFA_SECRET_KEY;
        this.statusUrl = process.env.EDFA_STATUS_URL;
    }
    
    async createPayment(
        amount: number, currency: string, callbackUrl: string,customer:Customer,
        card: { cardNumber: string, expiryMonth: number, expiryYear: number, cardHolderName: string, cvc: string },
        description?:string) 
    {
        const paymentOrderId = uuidv4();
        description = description || `Payment for order ${paymentOrderId}`;

        const formData = new NodeFormData()
        const hash = generateCardHash(customer.email,this.secretKey,card.cardNumber);
        formData.append('action', 'SALE');
        formData.append('client_key', this.merchantId);
        formData.append('order_id', paymentOrderId);
        formData.append('order_amount', amount.toString());
        formData.append('order_currency', currency);
        formData.append('order_description', description);
        formData.append('payer_first_name', customer.name);
        formData.append('payer_last_name', customer.name);
        formData.append('payer_address', 'N/A');
        formData.append('payer_country', 'SA');
        formData.append('payer_city', 'Riyadh');
        formData.append('payer_zip', '12221');
        formData.append('payer_email', customer.email);
        formData.append('payer_phone', customer.phone);
        formData.append('payer_ip', '176.44.76.222');
        formData.append('term_url_3ds', callbackUrl);
        formData.append('hash', hash);
        formData.append('card_number', "4111111111111111");
        formData.append('card_exp_month', "01");
        formData.append('card_exp_year', "2026");
        formData.append('card_cvv2', "100");
        
        const response = await axios.post(this.apiUrl, formData, {
            headers: formData.getHeaders()
        });

        const redirect_params = response.data.redirect_params.body;

        return { redirect_params,paymentOrderId,description,currency,hash};
    }

    async confirmPayment(orderId: string, gwayPaymentId: string,hash:string) {    
        const response = await axios.post(this.statusUrl, {
            order_id: orderId,
            gway_payment_id: gwayPaymentId,
            merchant_id: this.merchantId,
            hash: hash
        });
        if (response.data.responseBody.status === 'settled') {
            return true
        } else {
            return false
        }
    }
}