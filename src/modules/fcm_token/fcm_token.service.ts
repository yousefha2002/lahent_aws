import { Inject, Injectable } from '@nestjs/common';
import { FcmToken } from './entities/fcm_token.entity';
import { repositories } from 'src/common/enums/repositories';
import { RoleStatus } from 'src/common/enums/role_status';
// import { FirebaseService } from './common/firebase/firebase.service';

@Injectable()
export class FcmTokenService {
    constructor(
        @Inject(repositories.fcm_token_repository) private fcmTokenRepo: typeof FcmToken,
        // private readonly firebaseService: FirebaseService,
    ) {}

    /** تسجيل أو تحديث token لجهاز */
    async registerToken(userId: number, role: RoleStatus, token: string, deviceName?: string) {
        const existing = await this.fcmTokenRepo.findOne({ where: { userId, token,role } });
        if (!existing) {
            await this.fcmTokenRepo.create({ userId, role, token, deviceName });
        } else if (deviceName && existing.deviceName !== deviceName) {
            existing.deviceName = deviceName;
        await existing.save();
        }
    }

    /** حذف token عند logout من الجهاز فقط */
    async removeToken(token: string) {
        await this.fcmTokenRepo.destroy({ where: { token } });
    }

    /** إرسال إشعار لمستخدم واحد لجميع أجهزته */
    async notifyUser(
        userId: number,
        role: RoleStatus,
        title: string,
        body: string,
        data?: Record<string, string>,
    ) {
        const tokens = await this.fcmTokenRepo.findAll({
        where: { userId, role },
        attributes: ['token'],
        });

        if (tokens.length === 0) return { success: false, message: 'No devices found' };

        const tokenList = tokens.map(t => t.token);
        // await this.firebaseService.sendNotificationToMultiple(tokenList, title, body, data);

        return { success: true, notifiedDevices: tokenList.length };
    }

    /** إرسال إشعار لمجموعة من المستخدمين */
    async notifyUsers(
        users: { userId: number; role: RoleStatus }[],
        title: string,
        body: string,
        data?: Record<string, string>,
    ) {
        const tokens: string[] = [];
        for (const user of users) {
        const userTokens = await this.fcmTokenRepo.findAll({
            where: { userId: user.userId, role: user.role },
            attributes: ['token'],
        });
        tokens.push(...userTokens.map(t => t.token));
        }

        if (tokens.length === 0) return { success: false, message: 'No devices found' };
        // await this.firebaseService.sendNotificationToMultiple(tokens, title, body, data);

        return { success: true, notifiedDevices: tokens.length };
    }
}