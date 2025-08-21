import { AvatarService } from './../avatar/avatar.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Customer } from './entities/customer.entity';
import { OtpCodeService } from '../otp_code/otp_code.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { Avatar } from '../avatar/entities/avatar.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GiftService } from '../gift/gift.service';
import { Store } from '../store/entities/store.entity';
import { OpeningHour } from '../opening_hour/entites/opening_hour.entity';
import { SubType } from '../subtype/entities/subtype.entity';
import { SubTypeLanguage } from '../subtype/entities/sybtype_language.entity';
import { Type } from '../type/entities/type.entity';
import { TypeLanguage } from '../type/entities/type_language.entity';
import {generateAccessToken, generateRefreshToken } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(repositories.customer_repository)
    private customerRepo: typeof Customer,
    private otpCodeService: OtpCodeService,
    private cloudinaryService: CloudinaryService,
    private avatarService: AvatarService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => GiftService))
    private giftService: GiftService,
    private jwtService: JwtService
  ) {}
  async createCustomer(phone:string,lang=Language.en)
  {
    const customer = await this.findByPhone(phone)
    if(customer)
    {
      const message =this.i18n.translate('translation.mobile_phone_exists', { lang });
      throw new BadRequestException(message);
    }
    const new_customer = await this.customerRepo.create({phone})
    const amountCount = await this.giftService.updateGiftsForNewCustomer(
      new_customer.phone,
      new_customer.id,
    );
    new_customer.walletBalance = amountCount;
    await new_customer.save()
    return new_customer
  }

  async findById(id: number, lang = Language.en) {
    const customer = await this.customerRepo.findOne({
      where: { id },
      include: [{ model: Avatar }],
    });
    if (!customer) {
      const message = this.i18n.translate('translation.customer_not_found', {
        lang,
      });
      throw new NotFoundException(message);
    }
    return customer;
  }

  async login(phone: string, lang = Language.en) {
    const customer = await this.customerRepo.findOne({
      where: { phone },include:[Avatar],
    });
    if (!customer) {
      const message = this.i18n.translate('translation.invalid_credentials', {lang});
      throw new NotFoundException(message);
    }

    await customer.save()

    return {customer};
  }

  async refreshToken(refreshToken:string)
  {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: 'refresh_token',
      });
      const customer = await this.findById(decoded.id);

      if (customer.refreshToken !== refreshToken) {
        throw new BadRequestException('Invalid access token');
      }
      const accessToken = generateAccessToken({ id: customer.id, role: decoded.role });
      return { accessToken };
    } catch (err) {
      throw new BadRequestException('Invalid or expired acess token');
    }
  }

  async addToWallet(customerId: number, amount: number, transaction?: any) {
    const customer = await this.findById(customerId);
    customer.walletBalance += amount;
    await customer.save({ transaction });
  }

  async detuctPoints(customerId: number, amount: number, transaction?: any) {
    const customer = await this.findById(customerId);
    customer.points -= amount;
    await customer.save({ transaction });
  }

  async addPoints(customerId: number, amount: number, transaction?: any) {
    const customer = await this.findById(customerId);
    customer.points += amount;
    await customer.save({ transaction });
  }

  async detuctFromWallet(
    customerId: number,
    amount: number,
    transaction?: any,
  ) {
    const customer = await this.findById(customerId);
    customer.walletBalance -= amount;
    await customer.save({ transaction });
  }

  async updateProfile(customerId: number,dto: UpdateCustomerDto,lang = Language.en,file?: Express.Multer.File,) {
    const customer = await this.findById(customerId, lang);

    if (dto.email && dto.email !== customer.email) {
      const existing = await this.customerRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        const message = this.i18n.translate('translation.email_exists', {lang});
        throw new BadRequestException(message);
      }
    }

    const hasFile = !!file;
    const hasAvatarId = !!dto.avatarId;

    if (!hasFile && !hasAvatarId) {
      if (!customer.imageUrl && !customer.avatarId) {
        const message = this.i18n.translate(
          'translation.no_avatar_or_image',
          { lang },
        );
        throw new BadRequestException(message);
      }
    }

    if (hasFile) {
      if (customer.imagePublicId) {
        await this.cloudinaryService.deleteImage(customer.imagePublicId);
      }
      const uploaded = await this.cloudinaryService.uploadImage(file);
      customer.imageUrl = uploaded.secure_url;
      customer.imagePublicId = uploaded.public_id;
      customer.avatarId = null;
    } else if (hasAvatarId && dto.avatarId) {
      const avatar = await this.avatarService.findById(+dto.avatarId);
      customer.avatarId = +avatar.id;
      customer.imageUrl = null;
      customer.imagePublicId = null;
    }

    customer.name = dto.name;
    customer.email = dto.email;
    customer.isCompletedProfile = true;
    await customer.save();
    await customer.reload({ include: ['avatar'] });
    return customer;
  }

  async findByPhone(phone: string) {
    const customer = await this.customerRepo.findOne({ where: { phone } });
    return customer;
  }
}
