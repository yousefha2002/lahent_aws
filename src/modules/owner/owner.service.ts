import { UserTokenService } from './../user_token/user_token.service';
import {BadRequestException,Inject,Injectable, NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Owner } from './entities/owner.entity';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { generateAccessToken, generateRefreshToken } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';

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
    owner.email = dto.email;
    owner.isCompletedProfile = true

    await owner.save();
    return owner;
  }

  async refreshToken(refreshToken:string)
    {
      try {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token'});
        const tokenRecord = await this.userTokenService.findToken(refreshToken)
        if (!tokenRecord) {
          throw new BadRequestException('Invalid or expired refresh token');
        }
        const owner = await this.findById(decoded.id);
        if(!owner)
        {
          throw new BadRequestException('owner is not found')
        }
        const accessToken = generateAccessToken({ id: owner.id, role: decoded.role });
        const newRefreshToken = generateRefreshToken({id: owner.id,role: decoded.role});
        await this.userTokenService.rotateToken(tokenRecord,newRefreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS));
        return { accessToken, refreshToken: newRefreshToken };
      } catch (err) {
        throw new BadRequestException('Invalid or expired refresh token');
      }
    }

  async findById(id: number) {
    return this.ownerRepo.findOne({ where: { id } });
  }

  async findByPhone(phone:string)
  {
    return this.ownerRepo.findOne({ where: { phone} });
  }
}