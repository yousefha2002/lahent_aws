import { repositories } from 'src/common/enums/repositories';
import { Avatar } from '../entities/avatar.entity';
export const AvatarProvider = [
    {
        provide: repositories.avatar_repository,
        useValue: Avatar,
    },
];
