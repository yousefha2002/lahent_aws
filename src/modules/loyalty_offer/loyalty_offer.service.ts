import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltyOffer } from './entites/loyalty_offer.entity';
import { Op } from 'sequelize';
import { UpdateLoyaltyOfferDto } from './dto/update-loyalty-offer.dto';
import { CreateLoyaltyOfferDto } from './dto/create-loyalty-offer.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class LoyaltyOfferService {
    constructor(
        @Inject(repositories.loyalty_offer_repository) private loyaltyOfferModel: typeof LoyaltyOffer,
        private readonly i18n: I18nService
    ){}

    async create(dto: CreateLoyaltyOfferDto, lang = Language.ar) 
    {
        const now = new Date();
        const startDate = dto.startDate ?? now;
        const endDate = dto.endDate ?? null;

        if (startDate < now) {
            throw new BadRequestException(this.i18n.translate('translation.start_in_past', { lang }),);
        }
        if (endDate && endDate < now) {
            throw new BadRequestException(this.i18n.translate('translation.expired_date', { lang }),);
        }
        if (endDate && startDate >= endDate) {
            throw new BadRequestException(this.i18n.translate('translation.invalid_dates', { lang }),);
        }

        const offer = await this.loyaltyOfferModel.create({
            ...dto,
            startDate,
            endDate,
        });

        return offer;
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

    async update(id: number, dto: UpdateLoyaltyOfferDto, lang = Language.ar) 
    {
        const offer = await this.loyaltyOfferModel.findByPk(id);
        if (!offer) {
            const msg = this.i18n.translate('translation.loyalty_offer.not_found', { lang });
            throw new NotFoundException(msg);
        }

        const now = new Date();

        let startDate = offer.startDate;
        if ('startDate' in dto) {
            startDate = dto.startDate ?? new Date();
            if (startDate < now) {
            throw new BadRequestException(
                this.i18n.translate('translation.start_in_past', { lang }),
            );
            }
        }

        let endDate = offer.endDate; 
        if ('endDate' in dto) {
            endDate = dto.endDate ?? null; 
            if (endDate && endDate < now) {
            throw new BadRequestException(
                this.i18n.translate('translation.expired_date', { lang }),
            );
            }
        }
        if (endDate && startDate >= endDate) {
            throw new BadRequestException(
            this.i18n.translate('translation.invalid_dates', { lang }),
            );
        }
        await offer.update({ ...dto, startDate, endDate });
        return offer;
    }

    async toggleStatus(id: number, lang = Language.en) {
        const offer = await this.loyaltyOfferModel.findByPk(id);
        if (!offer) {
            const msg = this.i18n.translate('translation.loyalty_offer.not_found', { lang });
            throw new NotFoundException(msg);
        }

        offer.isActive = !offer.isActive;
        await offer.save();

        const msg = offer.isActive
            ? this.i18n.translate('translation.loyalty_offer.activated', { lang })
            : this.i18n.translate('translation.loyalty_offer.deactivated', { lang });

        return { message: msg, data: offer };
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