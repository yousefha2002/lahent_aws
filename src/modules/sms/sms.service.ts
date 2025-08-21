import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
    async sendSms(to: string, message: string) 
    {
        const token = "ku3ItEytcyZNrwqlQGCgmxYrPXH9mv1fNW2tFWu8";
        if (!token) {
            throw new Error('SMS_AUTH_TOKEN is not defined');
        }

        const payload = {
            number: to,
            messageBody: message,
            sendAtOption: 'Now',
            senderName: "Mobile.SA"
        };

        try {
            const response = await fetch('https://app.mobile.net.sa/api/v1/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const text = await response.text();

            const data = JSON.parse(text);

            if (!data || typeof data.status !== 'string' || data.status.toLowerCase() !== 'success') {
                throw new Error(data?.message || 'SMS sending failed');
            }

            return { success: true, data };
        } catch (error: any) {
            console.error('SMS Error:', error.message || error);
            throw new BadRequestException(error.message || 'Failed to send SMS');
        }
    }
}