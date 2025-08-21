import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Owner } from './entities/owner.entity';
import { OtpCodeService } from '../otp_code/otp_code.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { comparePassword, hashPassword } from 'src/common/utils/password';
import { RoleStatus } from 'src/common/enums/role_status';
import { LoginOwnerDto } from './dto/owner-login.dto';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { generateAccessToken, generateRefreshToken } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OwnerService {
  constructor(
    @Inject(repositories.owner_repository)
    private ownerRepo: typeof Owner,
    private otpCodeService: OtpCodeService,
    private readonly i18n: I18nService,
    private jwtService: JwtService
  ) {}

  async createOwner(dto: CreateOwnerDto, lang: Language = Language.en) {
    const otp = await this.otpCodeService.validateOtp(dto.phone, dto.token,RoleStatus.OWNER);
    const existing = await this.ownerRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      const msg = this.i18n.translate('translation.email_taken', { lang });
      throw new BadRequestException(msg);
    }

    const passwordHashed = await hashPassword(dto.password);
    const owner = await this.ownerRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: passwordHashed,
    });

    otp.isUsed = true;
    await otp.save();

    const payload = { id: owner.id, role: RoleStatus.OWNER };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    owner.refreshToken = refreshToken
    await owner.save()

    const { password, ...ownerWithoutPassword } = owner.toJSON();

    return {
      owner: ownerWithoutPassword,
      accessToken,
      refreshToken
    };
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

  async login(dto: LoginOwnerDto, lang: Language = Language.en) {
    const ownerByPass = await this.ownerRepo.findOne({ where: { phone: dto.phone } });
    if (!ownerByPass) {
      const msg = await this.i18n.translate('translation.invalid_phone', { lang });
      throw new NotFoundException(msg);
    }

    const isMatch = await comparePassword(dto.password, ownerByPass.password);
    if (!isMatch) {
      const msg = this.i18n.translate('translation.invalid_password', { lang });
      throw new BadRequestException(msg);
    }

    const payload = { id: ownerByPass.id, role: RoleStatus.OWNER };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    ownerByPass.refreshToken = refreshToken
    await ownerByPass.save()

    return {
      owner: ownerByPass,
      accessToken,
      refreshToken 
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
}