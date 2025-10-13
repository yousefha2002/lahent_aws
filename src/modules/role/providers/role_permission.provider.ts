import { repositories } from 'src/common/enums/repositories';
import { RolePermission } from '../entites/role_permission.entity';
export const RolePermissionProvider = [
    {
        provide: repositories.role_permission_repository,
        useValue: RolePermission,
    },
];
