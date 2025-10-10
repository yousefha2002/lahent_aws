import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Admin } from './entities/admin.entity';
import { comparePassword, hashPassword } from 'src/common/utils/password';
import { RoleStatus } from 'src/common/enums/role_status';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { generateAccessToken } from 'src/common/utils/generateToken';

@Injectable()
export class AdminService {
  constructor(
    @Inject(repositories.admin_repository) private adminRepo: typeof Admin,
    private readonly i18n: I18nService
  ) {}

  async signup(email: string, password: string,lang=Language.en) {
    const existingAdmin = await this.findOne();
    if (existingAdmin) {
      const msg = this.i18n.translate('translation.admin.already_exists', { lang });
      throw new BadRequestException(msg);
    }
    const passwordHashed = await hashPassword(password);
    const admin = await this.create(email, passwordHashed);
    const payload = { id: admin.id,role:RoleStatus.ADMIN };
    const access_token = generateAccessToken(payload);
    return { admin: { id: admin.id, email: admin.email }, token: access_token };
  }

  async login(email: string, password: string,lang=Language.en) {
    const adminByEmail = await this.findByEmail(email);
    if (!adminByEmail) {
      const msg = this.i18n.translate('translation.email_not_found', { lang });
      throw new NotFoundException(msg);
    }
    const isMatch = await comparePassword(password, adminByEmail.password);
    if (!isMatch) {
      const msg = this.i18n.translate('translation.invalid_credentials', { lang });
      throw new BadRequestException(msg);
    }
    const payload = { id: adminByEmail.id,role:RoleStatus.ADMIN };
    const access_token = generateAccessToken(payload);
    return {
      admin: { id: adminByEmail.id, email: adminByEmail.email },
      token: access_token,
    };
  }
  
  findByEmail(email: string) {
    return this.adminRepo.findOne({ where: { email } });
  }

  findOne() {
    return this.adminRepo.findOne();
  }

  async findOneById(id:number)
  {
    const admin = await this.adminRepo.findByPk(id)
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return admin
  }

  async create(email: string, password: string) {
    const admin = await this.adminRepo.create({ email, password });
    await admin.save();
    return admin;
  }
}