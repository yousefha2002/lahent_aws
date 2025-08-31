import { PaymentGateway } from "../interfaces/payment_session.interface";
import axios from "axios";
import { generateHash } from "src/common/utils/generateHash";
import { Customer } from "src/modules/customer/entities/customer.entity";
import * as NodeFormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';


export class EdFapayGateway implements PaymentGateway {
    private apiUrl: string;
    private merchantId: string;
    private secretKey: string;
    constructor() {
        if (!process.env.EDFA_API_URL || !process.env.EDFA_MERCHANT_ID || !process.env.EDFA_SECRET_KEY) {
            throw new Error('EDFAPAY environment variables are missing');
        }
        this.apiUrl = process.env.EDFA_API_URL;
        this.merchantId = process.env.EDFA_MERCHANT_ID;
        this.secretKey = process.env.EDFA_SECRET_KEY;
    }
    
    async createPayment(amount: number, currency: string, callbackUrl: string,customer:Customer,description?:string) 
    {
        const paymentOrderId = uuidv4();
        description = description || `Payment for order ${paymentOrderId}`;

        const formData = new NodeFormData()
        const hash = generateHash(paymentOrderId,amount.toString(),currency,description,this.secretKey);
        console.log(hash)

        formData.append('action', 'SALE');
        formData.append('edfa_merchant_id', this.merchantId);
        formData.append('order_id', paymentOrderId);
        formData.append('order_amount', amount.toString());
        formData.append('order_currency', currency);
        formData.append('order_description', description);
        formData.append('req_token', 'N');
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
        formData.append('auth', 'N');
        formData.append('recurring_init', 'N');
        formData.append('hash', hash);
        
        const response = await axios.post(this.apiUrl, formData, {
            headers: formData.getHeaders(), // الآن تعمل بدون مشاكل
        });

        const checkoutUrl = response.data.redirect_url;

        return { checkoutUrl,paymentOrderId,description,currency};
    }
}