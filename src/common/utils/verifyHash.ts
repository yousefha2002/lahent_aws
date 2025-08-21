import * as crypto from 'crypto';

export function verifyHash(body: any): boolean {
    const { order_id, amount, currency, hash } = body;
    const to_md5 = (order_id + amount + currency + 'YOUR_MERCHANT_PASSWORD').toUpperCase();
    const md5Hash = crypto.createHash('md5').update(to_md5).digest('hex');
    const sha1Hash = crypto.createHash('sha1').update(md5Hash).digest('hex');
    return sha1Hash === hash;
}