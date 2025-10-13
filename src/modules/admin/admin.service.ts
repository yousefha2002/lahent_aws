import { RoleService } from './../role/role.service';
import {Inject,Injectable,UnauthorizedException,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @Inject(repositories.admin_repository) private adminRepo: typeof Admin,
    private readonly roleService:RoleService
  ) {}
  async findOneById(id:number)
  {
    const admin = await this.adminRepo.findByPk(id)
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return admin
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
}