import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GiftCategory } from './entites/gift_category.entity';
import { repositories } from 'src/common/enums/repositories';
import { Op } from 'sequelize';
import { ActionGiftCategoryDto } from './dto/action-gift-category.dto';
import { GiftTemplate } from '../gift_template/entities/gift_template.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class GiftCategoryService {
    constructor(
        @Inject(repositories.gift_category_repository) 
        private giftCategoryModel: typeof GiftCategory,
        private readonly i18n: I18nService
    ) {}

    async create(dto: ActionGiftCategoryDto, lang = Language.en) {
        const { name } = dto;

        const exists = await this.giftCategoryModel.findOne({ where: { name } });
        if (exists) {
            const msg = this.i18n.translate('translation.name_exists', { lang });
            throw new BadRequestException(msg);
        }

        const category = await this.giftCategoryModel.create({ name });
        const msg = this.i18n.translate('translation.created', { lang });
        return { message: msg, category };
    }

    async update(id: number, dto: ActionGiftCategoryDto, lang = Language.en) {
        const { name } = dto;

        const category = await this.giftCategoryModel.findByPk(id);
        if (!category) {
            const msg = this.i18n.translate('translation.not_found', { lang });
            throw new NotFoundException(msg);
        }

        const exists = await this.giftCategoryModel.findOne({ where: { name, id: { [Op.ne]: id } } });
        if (exists) {
            const msg = this.i18n.translate('translation.name_exists', { lang });
            throw new BadRequestException(msg);
        }

        category.name = name;
        await category.save();
        const msg = this.i18n.translate('translation.category.updated', { lang });
        return { message: msg, category };
    }

    async checkIfCategoryFound(id: number, lang = Language.en) {
        const category = await this.giftCategoryModel.findOne({ where: { id } });
        if (!category) {
            const msg = this.i18n.translate('translation.not_found', { lang });
            throw new NotFoundException(msg);
        }
        return category;
    }

    async findAllWithTemplates() {
        return this.giftCategoryModel.findAll({
            include: [
                {
                    model: GiftTemplate,
                    attributes: ['id', 'imageUrl'],
                    order: [['createdAt', 'DESC']],
                    required: true
                }
            ]
        });
    }
}