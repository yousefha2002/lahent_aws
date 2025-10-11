import { UserTokenService } from './../user_token/user_token.service';
import {BadRequestException,Inject,Injectable, NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Owner } from './entities/owner.entity';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import {generateTokens } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';
import { Op } from 'sequelize';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { RoleStatus } from 'src/common/enums/role_status';

@Injectable()
export class OwnerService {
  constructor(
    @Inject(repositories.owner_repository)
    private ownerRepo: typeof Owner,
    private readonly i18n: I18nService,
    private jwtService: JwtService,
    private userTokenService:UserTokenService
  ) {}

  async createOwner(phone: string, lang: Language = Language.en) {
    const owner = await this.findByPhone(phone)
    if (owner) {
      const message =this.i18n.translate('translation.mobile_phone_exists', { lang });
      throw new BadRequestException(message);
    }

    const new_owner = await this.ownerRepo.create({phone});
    return new_owner
  }

  async updateOwnerProfile(ownerId: number, dto: UpdateOwnerDto, lang = Language.en) {
    const owner = await this.ownerRepo.findByPk(ownerId);
    if (!owner) {
      const message = this.i18n.translate('translation.owner_not_found', { lang });
      throw new BadRequestException(message);
    }
    if (dto.email && dto.email !== owner.email) {
      const existing = await this.ownerRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        const message = this.i18n.translate('translation.email_exists', { lang });
        throw new BadRequestException(message);
      }
    }
    owner.name = dto.name;
    owner.city = dto.city;
    owner.email = dto.email;
    owner.isCompletedProfile = true

    await owner.save();
    return owner;
  }

  async refreshToken(dto:RefreshTokenDto,device:string)
    {
      const {refreshToken,deviceId} = dto
      try {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token'});
        const tokenRecord = await this.userTokenService.findTokenForRefreshing(refreshToken,deviceId)
        if (!tokenRecord) {
          throw new BadRequestException('Invalid or expired refresh token');
        }
        const owner = await this.findById(decoded.id);
        const tokens = generateTokens(owner.id, RoleStatus.OWNER);
        await this.userTokenService.rotateToken(tokenRecord,tokens.refreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS));
        return { accessToken:tokens.accessToken, refreshToken: tokens.refreshToken };
      } catch (err) {
        throw new BadRequestException('Invalid or expired refresh token');
      }
    }

  async findById(id: number) {
    const owner = await this.ownerRepo.findOne({ where: { id } });
    if(!owner)
    {
      throw new BadRequestException('owner is not found')
    }
    return owner
  }

  async findByPhone(phone:string)
  {
    return this.ownerRepo.findOne({ where: { phone} ,paranoid: false});
  }

  async findAll(page = 1, limit = 10,name?: string,city?: string,phone?: string,email?:string) 
  {
    const offset = (page - 1) * limit;
    const whereStore: any = {
      ...(city && { city:{ [Op.like]: `%${city}%` } }),
      ...(phone && { phone: { [Op.like]: `%${phone}%` } }),
      ...(email && { email: { [Op.like]: `%${email}%` } }),
      ...(name && { name: { [Op.like]: `%${name}%` } })
    };
    const { rows, count } = await this.ownerRepo.findAndCountAll({
      limit,
      offset,
      where:whereStore,
      order: [['createdAt', 'DESC']]
    });
    const totalPages = Math.ceil(count / limit);
    return {
      data: rows,
      totalItems: count,
      totalPages,
    };
  }
  
  //deletion
  async findDeletedOwner(ownerId:number,transaction?:any)
  {
    const owner = await this.ownerRepo.findByPk(ownerId, { paranoid: false,transaction});
    if (!owner) throw new NotFoundException('Store not found');
    return owner
  }

  async findDeletedOwnersOlderThan(days: number, transaction?: any) 
  {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.ownerRepo.findAll({
      where: {
        deletedAt: { [Op.lt]: cutoffDate },
      },
      paranoid: false,
      transaction,
    });
  }
}