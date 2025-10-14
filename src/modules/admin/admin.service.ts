import { UserTokenService } from './../user_token/user_token.service';
import { RoleService } from './../role/role.service';
import {BadRequestException, ForbiddenException, Inject,Injectable,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Admin } from './entities/admin.entity';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { JwtService } from '@nestjs/jwt';
import {generateTokens } from 'src/common/utils/generateToken';
import { RoleStatus } from 'src/common/enums/role_status';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PermissionKey } from 'src/common/enums/permission-key';

@Injectable()
export class AdminService {
  constructor(
    @Inject(repositories.admin_repository) private adminRepo: typeof Admin,
    private readonly roleService:RoleService,
    private readonly userTokenService:UserTokenService,
    private jwtService: JwtService,
  ) {}

  async findOneById(id: number, options?: { includeRole?: boolean }) {
    const query: any = {
      where: { id, active: true }, // شرط الـ active
    };

    if (options?.includeRole) {
      query.include = [
        {
          association: 'role',
          include: [{ association: 'rolePermissions' }],
        },
      ];
    }

    return this.adminRepo.findOne(query);
  }

  async findByPhone(phone:string)
  {
    return this.adminRepo.findOne({ where: { phone} ,paranoid: false});
  }

  async createSuperAdmin() {
    const existingSuperAdmin = await this.adminRepo.findOne({ where: { isSuperAdmin: true } });
    if (existingSuperAdmin) return existingSuperAdmin;

    const role = await this.roleService.getOrCreateSuperAdminRole()

    const superAdmin = await this.adminRepo.create({
      name: 'Super Admin',
      phone: '966533353030',
      roleId: role.id,
      isSuperAdmin: true,
    });

    return superAdmin;
  }

  async refreshToken(dto:RefreshTokenDto)
    {
      const {refreshToken,deviceId} = dto
      try {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token'});
        const tokenRecord = await this.userTokenService.findTokenForRefreshing(refreshToken,deviceId)
        if (!tokenRecord) {
          throw new BadRequestException('Invalid or expired refresh token');
        }
        const admin = await this.findOneById(decoded.id);
        if(!admin)
        {
          throw new BadRequestException('admin is not found')
        }
        const tokens = generateTokens(admin.id, RoleStatus.ADMIN);
        await this.userTokenService.rotateToken(tokenRecord,tokens.refreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS));
        return { accessToken:tokens.accessToken, refreshToken: tokens.refreshToken };
      } catch (err) {
        throw new BadRequestException(err.message || 'Invalid or expired refresh token');
      }
  
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.findByPhone(dto.phone);
    if (existing) {
      throw new BadRequestException('Phone number already exists');
    }

    const role = await this.roleService.findById(dto.roleId);
    if (!role) {
      throw new BadRequestException('Invalid role ID');
    }

    const admin = await this.adminRepo.create({
      name: dto.name,
      phone: dto.phone,
      roleId: dto.roleId,
      isSuperAdmin: false,
    });

    return {message: 'Admin created successfully'};
  }

  async getAllAdmins(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.adminRepo.findAndCountAll({
      where: { isSuperAdmin: false },
      include: [
        {
          association: 'role',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'name', 'phone','active'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      totalPages: Math.ceil(count / limit),
      total: count,
      data:rows,
    };
  }

  async updateAdmin(id: number, dto: UpdateAdminDto) 
  {
    const admin = await this.adminRepo.findByPk(id);
    if(!admin)
    {
      throw new BadRequestException('admin is not found')
    }
    if (admin.isSuperAdmin) throw new BadRequestException('Cannot update Super Admin');

    if (dto.phone && dto.phone !== admin.phone) {
      const existing = await this.findByPhone(dto.phone);
      if (existing) throw new BadRequestException('Phone number already exists');
    }

    if (dto.roleId) {
      const role = await this.roleService.findById(dto.roleId);
      if (!role) throw new BadRequestException('Invalid role ID');
    }

    await admin.update({
      name: dto.name ?? admin.name,
      phone: dto.phone ?? admin.phone,
      active:dto.active??dto.active,
      roleId: dto.roleId ?? admin.roleId,
    });

    return { message: 'Admin updated successfully' };
  }

  async verifyAdminPermission(adminId: number, permissionKey: PermissionKey | string) {
    const admin = await this.findOneById(adminId, { includeRole: true });

    if (!admin) throw new ForbiddenException('Admin not found');

    if (admin.isSuperAdmin) return true;

    const permissions: string[] = admin.role?.permissions || [];

    if (!permissions.includes(permissionKey as PermissionKey)) {
      throw new ForbiddenException('Permission denied');
    }

    return true;
  }

  async getAdminWithPermissions(adminId: number) 
  {
    const admin = await this.findOneById(adminId, { includeRole: true });

    if (!admin) throw new BadRequestException('Admin not found');

    const permissions: string[] = admin.isSuperAdmin 
      ? Object.values(PermissionKey) 
      : admin.role?.permissions || [];

    return {
      id: admin.id,
      name: admin.name,
      phone: admin.phone,
      active: admin.active,
      isSuperAdmin: admin.isSuperAdmin,
      permissions,
    };
  }
}