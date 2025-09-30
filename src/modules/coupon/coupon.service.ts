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

    if (expiryDate && expiryDate < startDate) {
      const message = this.i18n.translate('translation.coupon.invalid_dates', { lang });
      throw new BadRequestException(message);
    }

    if (expiryDate && expiryDate < now) {
      const message = this.i18n.translate('translation.coupon.expired_date', { lang });
      throw new BadRequestException(message);
    }

    return this.couponRepo.create({
      ...dto,
      startDate,
      expiryDate,
    });
  }

  async updateCoupon(id: number, dto: UpdateCouponDto, lang: Language) {
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

      if (dto.startDate === undefined) {
        dto.startDate = coupon.startDate ?? now;
      } else if (dto.startDate === null) {
        dto.startDate = now;
      } else {
      if (dto.startDate < now) {
        const message = this.i18n.translate('translation.coupon.start_in_past', { lang });
        throw new BadRequestException(message);
      }
    }

    // ✅ expiryDate
    if (dto.expiryDate === undefined) {
      dto.expiryDate = coupon.expiryDate ?? null;
    }

    // ✅ تأكد أن expiry > start
    if (dto.expiryDate && dto.startDate && dto.expiryDate < dto.startDate) {
      const message = this.i18n.translate('translation.coupon.invalid_dates', { lang });
      throw new BadRequestException(message);
    }

    // ✅ expiry ما يكون منتهي
    if (dto.expiryDate && dto.expiryDate < now) {
      const message = this.i18n.translate('translation.coupon.expired_date', { lang });
      throw new BadRequestException(message);
    }

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

  async findAllForAdmin(page: number, limit: number) 
  {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.couponRepo.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}
