import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Role } from './entites/role.entity';

@Injectable()
export class RoleService {
    constructor(
        @Inject(repositories.role_repository) private roleRepo: typeof Role
    ){}
    async getOrCreateSuperAdminRole(): Promise<Role> {
        let superAdminRole = await this.roleRepo.findOne({ where: { name: 'SuperAdmin' } });
        if (!superAdminRole) {
        superAdminRole = await this.roleRepo.create({ name: 'SuperAdmin' });
        }
        return superAdminRole;
    }
}
