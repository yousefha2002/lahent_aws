import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CouponService {
  constructor(
    @Inject(repositories.coupon_repository) private couponRepo: typeof Coupon,
    private readonly i18n: I18nService,
  ) {}

  async createCoupon(dto: CreateCouponDto, lang:Language) 
  {
    const existing = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      const message = this.i18n.translate('translation.coupon.code_used', { lang });
      throw new BadRequestException(message);
    }

    const now = new Date();
    const startDate = dto.startDate ?? now;
    const expiryDate = dto.expiryDate ?? null;

    return this.couponRepo.create({
      ...dto,
      startDate,
      expiryDate,
    });
  }

  async updateCoupon(id: number, dto: UpdateCouponDto, lang: Language) 
  {
    const coupon = await this.couponRepo.findByPk(id);
    if (!coupon) {
      const message = this.i18n.translate('translation.coupon.not_found', { lang });
      throw new NotFoundException(message);
    }

    if (dto.code && dto.code !== coupon.code) {
      const exists = await this.couponRepo.findOne({ where: { code: dto.code } });
      if (exists) {
        const message = this.i18n.translate('translation.coupon.code_used_another', { lang });
        throw new BadRequestException(message);
      }
    }

    const now = new Date();

    if (dto.startDate === undefined) dto.startDate = coupon.startDate ?? now;
    if (dto.startDate === null) dto.startDate = now;

    if (dto.expiryDate === undefined) dto.expiryDate = coupon.expiryDate ?? null;

    await coupon.update(dto);
    return coupon;
  }

  async validateCoupon(code: string,lang: Language ) {
    const coupon = await this.couponRepo.findOne({ where: { code } });
    if (!coupon) {
      const message = this.i18n.translate('translation.coupon.not_found', { lang });
      throw new NotFoundException(message);
    }

    if (!coupon.isActive) {
      const message = this.i18n.translate('translation.coupon.inactive', { lang });
      throw new BadRequestException(message);
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      const message = this.i18n.translate('translation.coupon.not_started', { lang });
      throw new BadRequestException(message);
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      const message = this.i18n.translate('translation.coupon.expired', { lang });
      throw new BadRequestException(message);
    }

    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      const message = this.i18n.translate('translation.coupon.used_up', { lang });
      throw new BadRequestException(message);
    }

    return coupon;
  }

  increamntOCouponCount(id: number, transaction: any) {
    this.couponRepo.increment({ usedCount: 1 }, { where: { id }, transaction });
  }
}
