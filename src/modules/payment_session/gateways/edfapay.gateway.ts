import { PaymentGateway } from "../interfaces/payment_session.interface";
import axios from "axios";
import { generateApplePayHash, generateCardHash } from "src/common/utils/generateHash";
import { Customer } from "src/modules/customer/entities/customer.entity";
import * as NodeFormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from "@nestjs/common";
import { CardForApi } from "src/common/types/cardForApi";
import { ApplePayPaymentDTO } from "../dto/apple-payment.dto";


export class EdFapayGateway implements PaymentGateway {
    private apiUrl: string;
    private merchantId: string;
    private secretKey: string;
    private statusUrl: string;
    private applePayUrl: string;
    constructor() {
        if (!process.env.EDFA_API_PAYMENT_URL || !process.env.EDFA_MERCHANT_ID || !process.env.EDFA_SECRET_KEY || !process.env.EDFA_STATUS_URL || !process.env.EDFA_APPLEPAY_API_URL) {
            throw new Error('EDFAPAY environment variables are missing');
        }
        this.apiUrl = process.env.EDFA_API_PAYMENT_URL;
        this.merchantId = process.env.EDFA_MERCHANT_ID;
        this.secretKey = process.env.EDFA_SECRET_KEY;
        this.statusUrl = process.env.EDFA_STATUS_URL;
        this.applePayUrl = process.env.EDFA_APPLEPAY_API_URL;
        
    }
    
    async createPayment(amount: number, currency: string, callbackUrl: string,customer:Customer,card:CardForApi) 
    {
        const paymentOrderId = uuidv4();
        const description = `Payment for order ${paymentOrderId}`;
        const holderParts = card.cardHolderName.trim().split(' ');
        const firstName = holderParts.shift() || '';
        const lastName = holderParts.join(' ') || '';

        const formData = new NodeFormData()
        const hash = generateCardHash(customer.email,this.secretKey,card.cardNumber);
        formData.append('action', 'SALE');
        formData.append('client_key', this.merchantId);
        formData.append('order_id', paymentOrderId);
        formData.append('order_amount', amount.toString());
        formData.append('order_currency', currency);
        formData.append('order_description', description);
        formData.append('payer_first_name', firstName);
        formData.append('payer_last_name', lastName);
        formData.append('payer_address', 'N/A');
        formData.append('payer_country', 'SA');
        formData.append('payer_city', 'Riyadh');
        formData.append('payer_zip', '12221');
        formData.append('payer_email', customer.email);
        formData.append('payer_phone', customer.phone);
        formData.append('payer_ip', '176.44.76.222');
        formData.append('term_url_3ds', callbackUrl);
        formData.append('hash', hash);
        formData.append('card_number', card.cardNumber);
        formData.append('card_exp_month', card.expiryMonth);
        formData.append('card_exp_year', card.expiryYear);
        formData.append('card_cvv2', card.cvc);
        
        try {
        const response = await axios.post(this.apiUrl, formData, {headers: formData.getHeaders(),});        

        return { 
            redirectUrl: response.data.redirect_url,      
            redirectMethod: response.data.redirect_method,
            redirectParams: response.data.redirect_params.body, 
            paymentOrderId, 
            description, 
            currency, 
            hash };
        } catch (error: any) {
            if (error.response) {
            throw new BadRequestException(`Payment API error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
            throw new BadRequestException('No response from Payment API');
            } else {
            throw new BadRequestException(`Unexpected error: ${error.message}`);
            }
        }
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

    async createApplePayPayment(
    amount: number,
    currency: string,
    callbackUrl: string,
    customer: Customer,
    applePayData: ApplePayPaymentDTO,
    ) {
    try {
        const orderId = uuidv4();
        const description = `ApplePay payment for order ${orderId}`;
        const hash = generateApplePayHash(orderId, amount.toString(), currency, description, this.secretKey);

        const holderParts = customer.name.trim().split(' ');
        const firstName = holderParts.shift() || '';
        const lastName = holderParts.join(' ') || '';

        const formData = new NodeFormData();
        formData.append('action', 'SALE');
        formData.append('brand', 'applepay');
        formData.append('client_key', this.merchantId);
        formData.append('hash', hash);
        formData.append('order_id', orderId);
        formData.append('order_description', description);
        formData.append('order_currency', currency);
        formData.append('order_amount', amount.toString());
        formData.append('return_url', callbackUrl);
        formData.append('identifier', applePayData.transactionIdentifier);

        formData.append('payer_first_name', firstName);
        formData.append('payer_last_name', lastName);
        formData.append('payer_email', customer.email);
        formData.append('payer_phone', customer.phone);
        formData.append('payer_country', 'SA');
        formData.append('payer_city', 'Riyadh');
        formData.append('payer_ip', '176.44.76.222');

        // Apple Pay fields
        formData.append(
        'parameters',
        JSON.stringify({
            transactionIdentifier: applePayData.transactionIdentifier,
            paymentMethod: applePayData.paymentMethod,
            paymentData: {
            version: applePayData.version,
            data: applePayData.data,
            header: applePayData.header,
            signature: applePayData.signature,
            },
        }),
        );

        const response = await axios.post(this.applePayUrl, formData, {
        headers: { ...formData.getHeaders(), Accept: 'application/json', 'X-User-Agent': 'ios' },
        });

        if (response.data.result !== 'SUCCESS' && response.data.result !== 'SALE') {
        throw new BadRequestException(
            `Payment failed: ${response.data.decline_reason || response.data.result}`,
        );
        }

        return true;
    } catch (error) {
        console.error('Apple Pay Payment Error:', error);
        throw new BadRequestException(`Apple Pay payment error: ${error.message || error}`);
    }
    }
}