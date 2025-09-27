import { Injectable, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private initialized = false;

    async onModuleInit() {
        if (!this.initialized) {
        const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

        const secretValue = await secretsManager
            .getSecretValue({ SecretId: 'FIREBASE_CONFIG' })
            .promise();

        // parse أول مرة
        const outer = JSON.parse(secretValue.SecretString!);

        // parse ثاني مرة عشان يطلع firebase config الصحيح
        const firebaseConfig = JSON.parse(outer.FIREBASE_CONFIG);

        console.log('Firebase Project ID:', firebaseConfig.project_id);

        if (!admin.apps.length) {
            admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            });
            this.initialized = true;
        }
        }
    }

    async sendNotificationToMultiple(
        tokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>,
    ) {
        if (!this.initialized) {
        throw new Error('Firebase not initialized yet');
        }

        const multicastMessage: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data,
        };

        return await admin.messaging().sendEachForMulticast(multicastMessage);
    }
}