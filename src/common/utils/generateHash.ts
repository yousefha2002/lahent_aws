import * as crypto from 'crypto';

export function generateCardHash(email: string, password: string, cardNumber: string): string {
    // 1. reverse email
    const reversedEmail = email.split('').reverse().join('');

    // 2. reverse first 6 + last 4 digits of card number
    const cardPart = cardNumber.slice(0, 6) + cardNumber.slice(-4);
    const reversedCardPart = cardPart.split('').reverse().join('');

    // 3. concatenate reversedEmail + password + reversedCardPart
    const rawString = (reversedEmail + password + reversedCardPart).toUpperCase();

    // 4. create MD5 hash
    const hash = crypto.createHash('md5').update(rawString).digest('hex');

    return hash;
}