import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltyOffer } from './entites/loyalty_offer.entity';
import { Op, Sequelize } from 'sequelize';
import { UpdateLoyaltyOfferDto } from './dto/update-loyalty-offer.dto';
import { CreateLoyaltyOfferDto } from './dto/create-loyalty-offer.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { validateDates } from 'src/common/validators/date.validator';
import { validateCreateDates } from 'src/common/validators/create-date.validator';
import { AuditLogService } from '../audit_log/audit_log.service';
import { ActorInfo } from 'src/common/types/current-user.type';
import { normalizeDatesForAudit } from 'src/common/utils/normalizeDateForAduit';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class LoyaltyOfferService {
    constructor(
        @Inject(repositories.loyalty_offer_repository) private loyaltyOfferModel: typeof LoyaltyOffer,
        private readonly i18n: I18nService,
        private readonly auditLogService:AuditLogService,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    ){}

    async create(dto: CreateLoyaltyOfferDto, actor: ActorInfo, lang: Language) {
        const transaction = await this.sequelize.transaction();

        try {
            const { startDate, endDate } = validateCreateDates({
            start: dto.startDate,
            end: dto.endDate,
            i18n: this.i18n,
            lang,
        });

        const offer = await this.loyaltyOfferModel.create({...dto,startDate,endDate,},{ transaction },);

        const newEntity = normalizeDatesForAudit(offer.get({ plain: true }));

        await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.LOYALTYOFFER,
            action: AuditLogAction.CREATE,
            entityId: offer.id,
            newEntity,
            fieldsToExclude: ['createdAt', 'updatedAt'],
        });

        await transaction.commit();

        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return { message };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findAllForAdmin(page:number,limit:number) {
        const offset = (page - 1) * limit;
        const { rows, count } = await this.loyaltyOfferModel.findAndCountAll({
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

    async findActiveForCustomer() {
        return this.loyaltyOfferModel.findAll({
            where: { ...this.getActiveOfferCondition() },
            order: [['createdAt', 'DESC']],
        });
    }

    async update(id: number, actor: ActorInfo, dto: UpdateLoyaltyOfferDto, lang: Language) 
    {
        const transaction = await this.sequelize.transaction();

        try {
            const offer = await this.loyaltyOfferModel.findByPk(id);
            if (!offer) {
                throw new NotFoundException(this.i18n.translate('translation.loyalty_offer.not_found', { lang }));
            }

            const oldEntity = normalizeDatesForAudit(offer.get({ plain: true }));

            const { startDate, endDate } = validateDates({
                existingStart: offer.startDate,
                existingEnd: offer.endDate,
                newStart: dto.startDate,
                newEnd: dto.endDate,
                i18n: this.i18n,
                lang,
            });

            await offer.update({ ...dto, startDate, endDate }, { transaction });

            const newEntity = normalizeDatesForAudit(offer.get({ plain: true }));

            await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.LOYALTYOFFER,
            action: AuditLogAction.UPDATE,
            entityId: offer.id,
            oldEntity,
            newEntity,
            fieldsToExclude: ['createdAt', 'updatedAt'],
            });

            await transaction.commit();

            const message = this.i18n.translate('translation.updatedSuccefully', { lang });
            return { message };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async toggleStatus(id: number, actor: ActorInfo, lang: Language) {
        const transaction = await this.sequelize.transaction();

        try {
            const offer = await this.loyaltyOfferModel.findByPk(id);
            if (!offer) {
            const msg = this.i18n.translate('translation.loyalty_offer.not_found', { lang });
            throw new NotFoundException(msg);
            }

            const oldEntity = { ...offer.get({ plain: true }) };
            await offer.update({ isActive:!offer.isActive }, { transaction });

            const newEntity = offer.get({ plain: true })

            await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.LOYALTYOFFER,
            action: AuditLogAction.UPDATE,
            entityId: offer.id,
            oldEntity,
            newEntity,
            fieldsToExclude: ['createdAt', 'updatedAt'],
            });

            await transaction.commit();

            const msg = offer.isActive
            ? this.i18n.translate('translation.loyalty_offer.activated', { lang })
            : this.i18n.translate('translation.loyalty_offer.deactivated', { lang });

            return { message: msg, data: offer };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findByIdIfActive(id: number, lang = Language.en) {
        const offer = await this.loyaltyOfferModel.findOne({
            where: {
                id,
                ...this.getActiveOfferCondition()
            }
        });

        if (!offer) {
            const msg = this.i18n.translate('translation.loyalty_offer.not_active', { lang });
            throw new NotFoundException(msg);
        }
        return offer;
    }

    private getActiveOfferCondition() 
    {
        const now = new Date();
        return {
            isActive: true,
            startDate: { [Op.lte]: now },
            [Op.or]: [
                { endDate: null },         
                { endDate: { [Op.gte]: now } }, 
            ],
        };
    }
}