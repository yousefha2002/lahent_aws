import {BadRequestException,Inject,Injectable,NotFoundException,} from '@nestjs/common';
import { GiftCategory } from './entites/gift_category.entity';
import { repositories } from 'src/common/enums/repositories';
import { Op, Sequelize } from 'sequelize';
import {CreateGiftCategoryDto} from './dto/action-gift-category.dto';
import { GiftTemplate } from '../gift_template/entities/gift_template.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { GiftCategoryLanguage } from './entites/gift_category_language.entity';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogService } from '../audit_log/audit_log.service';
import { validateRequiredLanguages } from 'src/common/validators/translation-validator.';
import { buildMultiLangEntity } from 'src/common/utils/buildMultiLangEntity';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class GiftCategoryService {
  constructor(
    @Inject(repositories.gift_category_repository)
    private giftCategoryModel: typeof GiftCategory,
    @Inject(repositories.gift_categorylanguage__repository)
    private giftCategoryLanguageModel: typeof GiftCategoryLanguage,
    private readonly i18n: I18nService,
    private readonly auditLogService:AuditLogService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {}

  async create(dto: CreateGiftCategoryDto, actor: ActorInfo, lang: Language) 
  {
    const transaction = await this.sequelize.transaction();
    try {
      const codes = dto.languages.map(l => l.languageCode);
      validateRequiredLanguages(codes, 'gift category languages');

      for (const langItem of dto.languages) {
        const exists = await this.giftCategoryLanguageModel.findOne({
          where: { name: langItem.title, languageCode: langItem.languageCode },
          transaction,
        });
        if (exists) {
          const msg = this.i18n.translate('translation.name_exists', { lang });
          throw new BadRequestException(msg);
        }
      }

      const category = await this.giftCategoryModel.create({}, { transaction });

      for (const langItem of dto.languages) {
        await this.giftCategoryLanguageModel.create({
          giftCategoryId: category.id,
          languageCode: langItem.languageCode,
          name: langItem.title,
        }, { transaction });
      }

      const translationEntity = buildMultiLangEntity(dto.languages, ['title']);
      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.GIFTCATEGORY,
        action: AuditLogAction.CREATE,
        entityId: category.id,
        newEntity: {
          ...category.get({ plain: true }),
          ...translationEntity
        },
        fieldsToExclude: ['createdAt', 'updatedAt'],
      });

      await transaction.commit();

      const categoryWithLang = await this.giftCategoryModel.findByPk(category.id, {
        include: [{
          model: this.giftCategoryLanguageModel,
          attributes: ['id', 'languageCode', 'name'],
          where: { languageCode: lang },
          required: false,
        }],
      });

      const msg = this.i18n.translate('translation.createdSuccefully', { lang });
      return { message: msg, giftCategory: categoryWithLang };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id: number, dto: CreateGiftCategoryDto, actor: ActorInfo, lang: Language) 
  {
    const transaction = await this.sequelize.transaction();

    try {
      const { languages } = dto;

      const category = await this.giftCategoryModel.findByPk(id, { transaction });
      if (!category) {
        const msg = this.i18n.translate('translation.not_found', { lang });
        throw new NotFoundException(msg);
      }

      const oldLanguages = await this.giftCategoryLanguageModel.findAll({where: { giftCategoryId: id },transaction});
      const oldTranslationEntity = buildMultiLangEntity(oldLanguages, ['name']);

      for (const langItem of languages) {
        const exists = await this.giftCategoryLanguageModel.findOne({
          where: {
            name: langItem.title,
            languageCode: langItem.languageCode,
            giftCategoryId: { [Op.ne]: id },
          },
          transaction,
        });
        if (exists) {
          const msg = this.i18n.translate('translation.name_exists', { lang });
          throw new BadRequestException(msg);
        }

        const translation = await this.giftCategoryLanguageModel.findOne({
          where: { giftCategoryId: id, languageCode: langItem.languageCode },
          transaction,
        });

        if (translation) {
          translation.name = langItem.title;
          await translation.save({ transaction });
        } else {
          await this.giftCategoryLanguageModel.create({
            giftCategoryId: id,
            languageCode: langItem.languageCode,
            name: langItem.title,
          }, { transaction });
        }
      }

      const newLanguages = await this.giftCategoryLanguageModel.findAll({where: { giftCategoryId: id },transaction});
      const newTranslationEntity = buildMultiLangEntity(newLanguages, ['name']);

      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.GIFTCATEGORY,
        action: AuditLogAction.UPDATE,
        entityId: category.id,
        oldEntity:oldTranslationEntity,
        newEntity:newTranslationEntity,
        fieldsToExclude: ['createdAt', 'updatedAt'],
      });

      await transaction.commit();

      const msg = this.i18n.translate('translation.category.updated', { lang });
      return { message: msg, category };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async checkIfCategoryFound(id: number, lang = Language.en) {
    const category = await this.giftCategoryModel.findOne({ where: { id } });
    if (!category) {
      const msg = this.i18n.translate('translation.not_found', { lang });
      throw new NotFoundException(msg);
    }
    return category;
  }

  async findAllWithTemplates(lang = Language.en) {
    const now = new Date();

    return this.giftCategoryModel.findAll({
      include: [
        {
          model: GiftTemplate,
          attributes: ['id', 'imageUrl', 'startDate', 'endDate'],
          separate: true,
          limit: 3,
          order: [['createdAt', 'DESC']],
          where: {
            startDate: { [Op.lte]: now },
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: now } },
            ],
          },
        },
        {
          model: GiftCategoryLanguage,
          attributes: ['id', 'languageCode', 'name'],
          where: { languageCode: lang },
        },
      ],
    });
  }

  async findAllForAdmin() {
    return this.giftCategoryModel.findAll({
      include: [
        {
          model: GiftCategoryLanguage,
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}
