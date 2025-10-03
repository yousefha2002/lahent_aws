import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

const sa = JSON.parse(process.env.Firebase_SA!);

if (sa.private_key) {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n').trim();
}

@Injectable()
export class FirebaseService implements OnModuleInit {
    private initialized = false;

    async onModuleInit() {
        if (!this.initialized) {
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(sa), 
                });
                this.initialized = true;
            }
        }
    }

    async sendNotificationToMultiple(
        tokens: string[],
        title: string,
        data?: Record<string, string>,
    ) {
        if (!this.initialized) throw new Error('Firebase not initialized yet');

        const multicastMessage: admin.messaging.MulticastMessage = {
            tokens,
            notification: { title },
            data,
        };

        return await admin.messaging().sendEachForMulticast(multicastMessage);
    }
}