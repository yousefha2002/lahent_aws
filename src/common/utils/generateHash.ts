import * as crypto from 'crypto';

export function generateHash(order_number: string,order_amount: string,order_currency: string,order_description: string,password: string,)
{
    const rawString = (order_number +order_amount +order_currency +order_description +password).toUpperCase();
    const md5Hash = crypto.createHash('md5').update(rawString).digest('hex');
    const sha1Hash = crypto.createHash('sha1').update(md5Hash).digest('hex');
    return sha1Hash; 
}

export function generateWebhookHashWithDesc(order_number: string,order_amount: string,order_currency: string,order_description: string,password: string) 
{
    const rawString = 
        order_number +
        order_amount +
        order_currency +
        order_description +
        password;

    const upperString = rawString.toUpperCase();
    const md5Hash = crypto.createHash('md5').update(upperString).digest('hex');
    return md5Hash;
}

export function generateWebhookHashWithout(order_number: string,order_amount: string,order_currency: string,password: string) 
{
    const rawString = 
        order_number +
        order_amount +
        order_currency +
        password;

    const upperString = rawString.toUpperCase();
    const md5Hash = crypto.createHash('md5').update(upperString).digest('hex');
    return md5Hash;
}

export function generateWebhookHashWithIdAndDesc(id:string,order_number: string,order_amount: string,order_currency: string,order_description: string,password: string) 
{
    const rawString =
        id+ 
        order_number +
        order_amount +
        order_currency +
        order_description +
        password;

    const upperString = rawString.toUpperCase();
    const md5Hash = crypto.createHash('md5').update(upperString).digest('hex');
    return md5Hash;
}

export function generateWebhookHashWithId(id:string,order_number: string,order_amount: string,order_currency: string,password: string) 
{
    const rawString =
        id+ 
        order_number +
        order_amount +
        order_currency +
        password;

    const upperString = rawString.toUpperCase();
    const md5Hash = crypto.createHash('md5').update(upperString).digest('hex');
    return md5Hash;
}