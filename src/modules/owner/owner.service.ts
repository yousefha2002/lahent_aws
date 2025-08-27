import {BadRequestException,Inject,Injectable, NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Owner } from './entities/owner.entity';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { generateAccessToken } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OwnerService {
  constructor(
    @Inject(repositories.owner_repository)
    private ownerRepo: typeof Owner,
    private readonly i18n: I18nService,
    private jwtService: JwtService
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

  async login(phone: string, lang = Language.en) {
    const owner = await this.ownerRepo.findOne({where: { phone }});
    if (!owner) {
      const message = this.i18n.translate('translation.invalid_credentials', {lang});
      throw new NotFoundException(message);
    }
    await owner.save()
    return {owner};
  }

  async updateOwner(dto: UpdateOwnerDto, owner: Owner, lang: Language = Language.en) {
    if (dto.email && dto.email !== owner.email) {
      const existing = await this.ownerRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        const msg = await this.i18n.translate('translation.email_taken', { lang });
        throw new BadRequestException(msg);
      }
    }

    Object.assign(owner, dto);
    await owner.save();
    const msg = this.i18n.translate('translation.owner_updated', { lang });

    return {
      message: msg,
      owner,
    };
  }

  async refreshToken(refreshToken:string)
    {
      try {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token',});
        const owner = await this.findById(decoded.id);
        
        if (owner&&owner.refreshToken !== refreshToken) {
          throw new BadRequestException('Invalid refresh token');
        }
        const accessToken = generateAccessToken({ id: owner?.id, role: decoded.role });
        return { accessToken };
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