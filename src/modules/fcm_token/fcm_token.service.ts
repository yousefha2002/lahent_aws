import { Inject, Injectable } from '@nestjs/common';
import { FcmToken } from './entities/fcm_token.entity';
import { repositories } from 'src/common/enums/repositories';
import { RoleStatus } from 'src/common/enums/role_status';
import { FirebaseService } from './common/firebase/firebase.service';
import { RegisterFcmTokenDto } from './dtos/register_fcm_token.dto';

@Injectable()
export class FcmTokenService {
    constructor(
        @Inject(repositories.fcm_token_repository) private fcmTokenRepo: typeof FcmToken,
        private readonly firebaseService: FirebaseService,
    ) {}

    /** تسجيل أو تحديث token لجهاز */
    async registerToken(userId: number,role: RoleStatus,dto:RegisterFcmTokenDto,deviceName?: string) 
    {
        const {deviceId,token} = dto
        const tokens = await this.fcmTokenRepo.findAll({where:{token}})
        await this.fcmTokenRepo.destroy({ where: { token } });
        const existing = await this.fcmTokenRepo.findOne({ where: { userId, role, deviceId } });
        if (!existing) {
            await this.fcmTokenRepo.create({ userId, role, token, deviceId, deviceName });
        } else {
            // إذا تغير الـ token (مثلاً بعد إعادة تثبيت التطبيق)، حدّثه
            if (existing.token !== token) existing.token = token;
            if (deviceName && existing.deviceName !== deviceName) existing.deviceName = deviceName;
            await existing.save();
        }
    }

    /** حذف token عند logout من الجهاز فقط */
    async removeTokenByDevice(userId: number, deviceId: string,role:RoleStatus) {
        await this.fcmTokenRepo.destroy({ where: { userId, deviceId,role } });
    }

    // عند حذف التطبيق
    async removeTokenByToken(token: string) {
        await this.fcmTokenRepo.destroy({ where: { token } });
    }

    /** إرسال إشعار لمستخدم واحد لجميع أجهزته */
    async notifyUser(
        userId: number,
        role: RoleStatus,
        title: string,
        data?: Record<string, string>,
    ) {
        const tokens = await this.fcmTokenRepo.findAll({
        where: { userId, role },
        attributes: ['token'],
        });

        if (tokens.length === 0) return { success: false, message: 'No devices found' };

        const tokenList = tokens.map(t => t.token);
        await this.firebaseService.sendNotificationToMultiple(tokenList, title, data);

        return { success: true, notifiedDevices: tokenList.length };
    }

    /** إرسال إشعار لمجموعة من المستخدمين */
    async notifyUsers(
        users: { userId: number; role: RoleStatus }[],
        title: string,
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
        await this.firebaseService.sendNotificationToMultiple(tokens, title, data);

        return { success: true, notifiedDevices: tokens.length };
    }
}