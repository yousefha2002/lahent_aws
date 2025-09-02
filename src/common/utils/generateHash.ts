import * as crypto from 'crypto';

export function generateHash(order_number: string,order_amount: string,order_currency: string,order_description: string,password: string,)
{
    const rawString = (order_number +order_amount +order_currency +order_description +password).toUpperCase();
    const md5Hash = crypto.createHash('md5').update(rawString).digest('hex');
    const sha1Hash = crypto.createHash('sha1').update(md5Hash).digest('hex');
    return sha1Hash; 
}

export function generateWebhookHash(payment_public_id: string,order_number: string,order_amount: string,order_currency: string,order_description: string,password: string) 
{
    console.log('start')
    const rawString = 
        payment_public_id +
        order_number +
        order_amount +
        order_currency +
        order_description +
        password;

    console.log("👉 raw string (before uppercase):", rawString);

    const upperString = rawString.toUpperCase();
    console.log("👉 raw string (after uppercase):", upperString);

    const md5Hash = crypto.createHash('md5').update(upperString).digest('hex');
    console.log("👉 generated MD5:", md5Hash);
    console.log('finish')
    return md5Hash;
}
