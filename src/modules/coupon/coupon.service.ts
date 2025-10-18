import { AuditLogService } from './../audit_log/audit_log.service';
import {
  BadRequestException,
  forwardRef,
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
import { validateDates } from 'src/common/validators/date.validator';
import { validateCreateDates } from 'src/common/validators/create-date.validator';
import { OrderService } from '../order/services/order.service';
import { ActorInfo } from 'src/common/types/current-user.type';
import { Sequelize } from 'sequelize';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { normalizeDatesForAudit } from 'src/common/utils/normalizeDateForAduit';

@Injectable()
export class CouponService {
  constructor(
    @Inject(repositories.coupon_repository) private couponRepo: typeof Coupon,
    private readonly i18n: I18nService,
    private readonly auditLogService:AuditLogService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,

    @Inject(forwardRef(() => OrderService))
    private orderService:OrderService
    ) {}

  async createCoupon(dto: CreateCouponDto, lang: Language, actor: ActorInfo) {
    const transaction = await this.sequelize.transaction();


    try {
      const existing = await this.couponRepo.findOne({
        where: { code: dto.code },
        transaction,
      });
      if (existing) {
        const message = this.i18n.translate('translation.coupon.code_used', { lang });
        throw new BadRequestException(message);
      }

      const { startDate, endDate: expiryDate } = validateCreateDates({
        start: dto.startDate,
        end: dto.expiryDate,
        i18n: this.i18n,
        lang,
      });

      const coupon = await this.couponRepo.create(
        {
          ...dto,
          startDate,
          expiryDate,
        },
        { transaction },
      );

      const newEntity = normalizeDatesForAudit(coupon.get({ plain: true }));

      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.COUPON,
        action: AuditLogAction.CREATE,
        entityId: coupon.id,
        newEntity,
        fieldsToExclude: ['createdAt', 'updatedAt'],
      });

      await transaction.commit();

      const message = this.i18n.translate('translation.createdSuccefully', { lang });
      return { message, coupon };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateCoupon(id: number, actor: ActorInfo, dto: UpdateCouponDto, lang: Language)
  {
    const transaction = await this.sequelize.transaction();

    try {
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

      const { startDate, endDate } = validateDates({
        existingStart: coupon.startDate,
        existingEnd: coupon.expiryDate,
        newStart: dto.startDate,
        newEnd: dto.expiryDate,
        i18n: this.i18n,
        lang,
      });

      const oldEntity = normalizeDatesForAudit(coupon.get({ plain: true }));

      await coupon.update({ ...dto, startDate, expiryDate: endDate }, { transaction });
      const newEntity = normalizeDatesForAudit(coupon.get({ plain: true }));

      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.COUPON,
        entityId: coupon.id,
        action: AuditLogAction.UPDATE,
        oldEntity,
        newEntity,
        fieldsToExclude: ['createdAt', 'updatedAt'],
      });

      await transaction.commit();
      return coupon;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async validateCoupon(code: string,customerId:number,lang: Language ) {
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

    const usedBefore = await this.orderService.hasUsedCouponBefore(customerId, coupon.id);
    if (usedBefore) {
      throw new BadRequestException(
        this.i18n.translate('translation.coupon.already_used', { lang })
      );
    }

    return coupon;
  }

  increamntOCouponCount(id: number, transaction: any) {
    this.couponRepo.increment({ usedCount: 1 }, { where: { id }, transaction });
  }

  decrementCouponCount(id: number, transaction: any)
  {
    this.couponRepo.decrement({ usedCount: 1 }, { where: { id }, transaction });
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
