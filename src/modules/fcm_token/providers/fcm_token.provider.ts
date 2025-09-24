import { FcmToken } from './../entities/fcm_token.entity';
import { repositories } from 'src/common/enums/repositories';
export const FcmTokenProvider = [
    {
        provide: repositories.fcm_token_repository,
        useValue: FcmToken,
    },
];