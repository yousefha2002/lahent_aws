import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
const serviceAccount = require(join(__dirname, 'lahentnotification-firebase-adminsdk-fbsvc-eaea030a60.json'));

@Injectable()
export class FirebaseService {
    constructor() {
        admin.initializeApp({credential: admin.credential.cert(serviceAccount as any)});
    }

    async sendNotificationToMultiple(tokens: string[], title: string, body: string, data?: Record<string, string>) 
    {
        const multicastMessage: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data,
        };
        return await admin.messaging().sendEachForMulticast(multicastMessage);
    }
}