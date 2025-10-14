import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Role } from './entites/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolePermission } from './entites/role_permission.entity';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { Admin } from '../admin/entities/admin.entity';
import { Op } from 'sequelize';

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

    async findAllRoles(withCounts = false) {
        if (!withCounts) {
            // إذا بدون count
            return this.roleRepo.findAll({
                attributes: ['id', 'name'],
                where: { name: { [Op.ne]: 'SuperAdmin' } },
            });
        }

        // إذا مع count
        const roles = await this.roleRepo.findAll({
            where: { name: { [Op.ne]: 'SuperAdmin' } },
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

    async updateRoleWithPermissions(roleId: number, dto: CreateRoleDto, lang: Language) 
    {
        const role = await this.roleRepo.findByPk(roleId);
        if (!role) {
            throw new BadRequestException(this.i18n.translate('translation.not_found', { lang }));
        }

        if (dto.name && dto.name !== role.name) {
            const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
            if (existing) {
                throw new BadRequestException(this.i18n.translate('translation.name_exists', { lang }));
            }
            role.name = dto.name;
            await role.save();
        }

        await this.rolePermissionRepo.destroy({ where: { roleId } });

        const permissions = dto.permissions
            .filter(p => p)
            .map(permission => ({
                roleId: role.id,
                permission,
            }));

        if (permissions.length > 0) {
            await this.rolePermissionRepo.bulkCreate(permissions);
        }

        const message = this.i18n.translate('translation.updatedSuccefully', { lang });
        return { message };
    }

    async findOneRoleWithDetails(id: number, lang: Language, withAdmins = true) 
    {
        const includeModels: any[] = [
            {
            model: this.rolePermissionRepo,
            attributes: ['id', 'permission'],
            },
        ];

        // فقط لو المستخدم طالب admin
        if (withAdmins) {
            includeModels.push({
            model: Admin,
            attributes: ['id', 'name', 'phone'],
            });
        }

        const role = await this.roleRepo.findByPk(id, { include: includeModels });

        if (!role) {
            throw new BadRequestException(
            this.i18n.translate('translation.not_found', { lang }),
            );
        }

        return {
            id: role.id,
            name: role.name,
            rolePermissions:
            role.rolePermissions?.map((p) => ({
                id: p.id,
                permission: p.permission,
            })) || [],
            admins:
            withAdmins && role.admins
                ? role.admins.map((a) => ({
                    id: a.id,
                    name: a.name,
                    phone: a.phone,
                }))
                : [],
        };
    }

    async findById(id: number) {
        return this.roleRepo.findOne({
            where: {
            id,
            name: { [Op.ne]: 'SuperAdmin'},
            },
        });
    }
}