import { repositories } from 'src/common/enums/repositories';
import { Admin } from '../entities/admin.entity';
export const AdminProvider = [
    {
        provide: repositories.admin_repository,
        useValue: Admin,
    },
];
