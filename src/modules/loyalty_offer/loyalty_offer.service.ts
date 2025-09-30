import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltyOffer } from './entites/loyalty_offer.entity';
import { Op } from 'sequelize';
import { UpdateLoyaltyOfferDto } from './dto/update-loyalty-offer.dto';
import { CreateLoyaltyOfferDto } from './dto/create-loyalty-offer.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { validateDates } from 'src/common/validators/date.validator';
import { validateCreateDates } from 'src/common/validators/create-date.validator';

@Injectable()
export class LoyaltyOfferService {
    constructor(
        @Inject(repositories.loyalty_offer_repository) private loyaltyOfferModel: typeof LoyaltyOffer,
        private readonly i18n: I18nService
    ){}

    async create(dto: CreateLoyaltyOfferDto, lang : Language) 
    {
        const { startDate, endDate } = validateCreateDates({
            start: dto.startDate,
            end: dto.endDate,
            i18n: this.i18n,
            lang,
        });

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

    async update(id: number, dto: UpdateLoyaltyOfferDto, lang:Language) 
    {
        const offer = await this.loyaltyOfferModel.findByPk(id);
        if (!offer) {
            throw new NotFoundException(
            this.i18n.translate('translation.loyalty_offer.not_found', { lang })
            );
        }

        const { startDate, endDate } = validateDates({
            existingStart: offer.startDate,
            existingEnd: offer.endDate,
            newStart: dto.startDate,
            newEnd: dto.endDate,
            i18n: this.i18n,
            lang,
        });

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