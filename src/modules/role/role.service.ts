import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Role } from './entites/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolePermission } from './entites/role_permission.entity';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { Admin } from '../admin/entities/admin.entity';

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

    async createRoleWithPermissions(dto: CreateRoleDto, lang: Language) {
        const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new BadRequestException('Role name already exists');
        }

        const role = await this.roleRepo.create({ name: dto.name });

        const permissions = dto.permissions
            .filter(p => p) 
            .map(permission => ({
                roleId: role.id,
                permission,
            }));

        if (permissions.length > 0) {
            await this.rolePermissionRepo.bulkCreate(permissions);
        }

        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return { message };
    }

    async findAllRolesWithCounts() {
        const roles = await this.roleRepo.findAll({
            include: [
                { model: this.rolePermissionRepo, attributes: ['id'] },
                { model: Admin, attributes: ['id'] },
            ],
        });

        return roles.map(role => ({
            id: role.id,
            name: role.name,
            adminCount: role.admins?.length || 0,
            permissionCount: role.rolePermissions?.length || 0,
        }));
    }
}