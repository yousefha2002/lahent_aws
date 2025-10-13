import { repositories } from 'src/common/enums/repositories';
import { Role } from '../entites/role.entity';
export const RoleProvider = [
    {
        provide: repositories.role_repository,
        useValue: Role,
    },
];
