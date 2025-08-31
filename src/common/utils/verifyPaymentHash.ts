import * as crypto from 'crypto';

export function verifyPaymentHash(
    order_number: string,
    order_amount: string,
    order_currency: string,
    order_description: string,
    password: string
) {
    const rawString = (order_number + order_amount + order_currency + order_description + password).toUpperCase();
    const md5Hash = crypto.createHash('md5').update(rawString).digest('hex');
    return md5Hash;
}