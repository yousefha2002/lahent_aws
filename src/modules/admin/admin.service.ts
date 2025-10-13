import { UserTokenService } from './../user_token/user_token.service';
import { RoleService } from './../role/role.service';
import {BadRequestException, Inject,Injectable,UnauthorizedException,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Admin } from './entities/admin.entity';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { JwtService } from '@nestjs/jwt';
import { generateAccessToken, generateRefreshToken, generateTokens } from 'src/common/utils/generateToken';
import { RoleStatus } from 'src/common/enums/role_status';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';

@Injectable()
export class AdminService {
  constructor(
    @Inject(repositories.admin_repository) private adminRepo: typeof Admin,
    private readonly roleService:RoleService,
    private readonly userTokenService:UserTokenService,
    private jwtService: JwtService,
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
        const tokens = generateTokens(admin.id, RoleStatus.ADMIN);
        await this.userTokenService.rotateToken(tokenRecord,tokens.refreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS));
        return { accessToken:tokens.accessToken, refreshToken: tokens.refreshToken };
      } catch (err) {
        throw new BadRequestException(err.message || 'Invalid or expired refresh token');
      }
    }
}