import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Role } from './entites/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolePermission } from './entites/role_permission.entity';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class RoleService {
    constructor(
        @Inject(repositories.role_repository) private roleRepo: typeof Role,
        @Inject(repositories.role_permission_repository) private rolePermissionRepo:typeof RolePermission,
        private readonly i18n: I18nService
    ){}
    async getOrCreateSuperAdminRole(): Promise<Role> {
        let superAdminRole = await this.roleRepo.findOne({ where: { name: 'SuperAdmin' } });
        if (!superAdminRole) {
        superAdminRole = await this.roleRepo.create({ name: 'SuperAdmin' });
        }
        return superAdminRole;
    }

    async createRoleWithPermissions(dto: CreateRoleDto,lang:Language){
        const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new BadRequestException('Role name already exists');
        }

        const role = await this.roleRepo.create({ name: dto.name });

        const permissions = dto.permissions.map(permission => ({
        roleId: role.id,
        permission,
        }));
        await this.rolePermissionRepo.bulkCreate(permissions);

        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return {message}
    }
}