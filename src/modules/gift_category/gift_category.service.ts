import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftCategory } from './entites/gift_category.entity';
import { repositories } from 'src/common/enums/repositories';
import { Op } from 'sequelize';
import {
  CreateGiftCategoryDto,
  GiftCategoryLanguage as GiftCategoryLanguageDto,
} from './dto/action-gift-category.dto';
import { GiftTemplate } from '../gift_template/entities/gift_template.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { GiftCategoryLanguage } from './entites/gift_category_language.entity';

@Injectable()
export class GiftCategoryService {
  constructor(
    @Inject(repositories.gift_category_repository)
    private giftCategoryModel: typeof GiftCategory,
    @Inject(repositories.gift_categorylanguage__repository)
    private giftCategoryLanguageModel: typeof GiftCategoryLanguage,
    private readonly i18n: I18nService,
  ) {}

  // ---------- CREATE ----------
  async create(dto: CreateGiftCategoryDto, lang = Language.en) {
    const { languages } = dto;

    // تحقق إذا في أي اسم مستخدم من قبل
    for (const langItem of languages) {
      const exists = await this.giftCategoryLanguageModel.findOne({
        where: { name: langItem.title, languageCode: langItem.languageCode },
      });
      if (exists) {
        const msg = this.i18n.translate('translation.name_exists', { lang });
        throw new BadRequestException(msg);
      }
    }

    // إنشاء الفئة الأساسية
    const category = await this.giftCategoryModel.create({});

    // إنشاء الترجمات المرتبطة
    for (const langItem of languages) {
      await this.giftCategoryLanguageModel.create({
        giftCategoryId: category.id,
        languageCode: langItem.languageCode,
        name: langItem.title,
      });
    }

    // جلب الفئة مع الترجمة بناءً على اللغة المطلوبة
    const categoryWithLang = await this.giftCategoryModel.findByPk(
      category.id,
      {
        include: [
          {
            model: this.giftCategoryLanguageModel,
            attributes: ['id', 'languageCode', 'name'],
            where: { languageCode: lang },
            required: false, // لو مش موجود ترجمة لهاي اللغة ما يعمل error
          },
        ],
      },
    );

    const msg = this.i18n.translate('translation.createdSuccefully', { lang });
    return { message: msg, giftCategory: categoryWithLang };
  }

  // ---------- UPDATE ----------
  async update(id: number, dto: CreateGiftCategoryDto, lang = Language.en) {
    const { languages } = dto;

    const category = await this.giftCategoryModel.findByPk(id);
    if (!category) {
      const msg = this.i18n.translate('translation.not_found', { lang });
      throw new NotFoundException(msg);
    }

    for (const langItem of languages) {
      // تحقق من الاسم إن كان مستخدم في كاتيجوري آخر
      const exists = await this.giftCategoryLanguageModel.findOne({
        where: {
          name: langItem.title,
          languageCode: langItem.languageCode,
          giftCategoryId: { [Op.ne]: id },
        },
      });
      if (exists) {
        const msg = this.i18n.translate('translation.name_exists', { lang });
        throw new BadRequestException(msg);
      }

      // ابحث إن كان هناك سجل للغة نفسها
      const translation = await this.giftCategoryLanguageModel.findOne({
        where: { giftCategoryId: id, languageCode: langItem.languageCode },
      });

      if (translation) {
        // تحديث
        translation.name = langItem.title;
        await translation.save();
      } else {
        // إضافة ترجمة جديدة
        await this.giftCategoryLanguageModel.create({
          giftCategoryId: id,
          languageCode: langItem.languageCode,
          name: langItem.title,
        });
      }
    }

    const msg = this.i18n.translate('translation.category.updated', { lang });
    return { message: msg, category };
  }

  // ---------- CHECK ----------
  async checkIfCategoryFound(id: number, lang = Language.en) {
    const category = await this.giftCategoryModel.findOne({ where: { id } });
    if (!category) {
      const msg = this.i18n.translate('translation.not_found', { lang });
      throw new NotFoundException(msg);
    }
    return category;
  }

  // ---------- FIND ALL WITH TEMPLATES ----------
  async findAllWithTemplates(lang = Language.en) {
    return this.giftCategoryModel.findAll({
      include: [
        {
          model: GiftTemplate,
          attributes: ['id', 'imageUrl'],
          order: [['createdAt', 'DESC']],
          limit: 3,
          separate: true,
        },
        {
          model: GiftCategoryLanguage,
          attributes: ['id', 'languageCode', 'name'],
          where: { languageCode: lang },
        },
      ],
    });
  }
}
