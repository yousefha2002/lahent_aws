import { repositories } from 'src/common/enums/repositories';
import { UserToken } from '../entities/user_token.entity';
export const UserTokenProvider = [
    {
        provide: repositories.user_token_repository,
        useValue: UserToken,
    },
];