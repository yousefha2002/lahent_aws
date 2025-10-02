import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { VariantCategory } from './entities/variant_category.entity';
import { Sequelize } from 'sequelize';
import { VariantCategoryLanguage } from './entities/variant_category_language.entity';
import { CreateVariantCategoryDto } from './dto/create_variant_category.dto';
import { Language } from 'src/common/enums/language';
import { validateRequiredLanguages } from 'src/common/validators/translation-validator.';
import { UpdateVariantCategoryDto } from './dto/update_variant_category.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class VariantCategoryService {
    constructor(
        @Inject(repositories.variant_category_repository) private variantCategoryRepo: typeof VariantCategory,
        @Inject(repositories.variant_category_language_repository) private variantCategoryLanguageRepo: typeof VariantCategoryLanguage,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly i18n: I18nService
    ){}

    async create(createDto: CreateVariantCategoryDto,lang:Language) 
    {
        const { languages } = createDto;
        const codes = languages.map(l => l.languageCode);
        validateRequiredLanguages(codes, 'variant category languages');

        const t = await this.sequelize.transaction();
        try {
        for (const lang of languages) {
            const exists = await VariantCategoryLanguage.findOne({
            where: { name: lang.name, languageCode: lang.languageCode },
            transaction: t,
            });
            if (exists) {
            throw new BadRequestException(
                `Variant category with name "${lang.name}" already exists for language ${lang.languageCode}`,
            );
            }
        }

        const category = await this.variantCategoryRepo.create({}, { transaction: t });

        const categoryLanguages = await Promise.all(
            languages.map(lang =>
            this.variantCategoryLanguageRepo.create(
                {
                variantCategoryId: category.id,
                languageCode: lang.languageCode,
                name: lang.name,
                },
                { transaction: t },
            ),
            ),
        );
        await t.commit();

        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return { message };
        } catch (error) {
        await t.rollback();
        throw error;
        }
    }

    getAll(lang?:Language)
    {
        const includeOptions: any = { model: VariantCategoryLanguage };
        if (lang) {
            includeOptions.where = { languageCode: lang };
        }
        return this.variantCategoryRepo.findAll({include:[includeOptions]})
    }

    async findOne(categoryId:number)
    {
        const category = await this.variantCategoryRepo.findOne({where:{id:categoryId}})
        if(!category)
        {
            throw new Error('category is not found')
        }
        return category
    }

    async update(id: number, dto: UpdateVariantCategoryDto, lang: Language) {
    const transaction = await this.sequelize.transaction();
    try {
        const category = await this.variantCategoryRepo.findByPk(id);
        if (!category) {
        throw new BadRequestException(this.i18n.translate('translation.not_found', { lang }));
        }

        if (dto.languages) {
        const codes = dto.languages.map(l => l.languageCode);
        validateRequiredLanguages(codes, 'variant category languages');

        for (const langObj of dto.languages) {
            const existingLang = await this.variantCategoryLanguageRepo.findOne({
            where: {
                variantCategoryId: id,
                languageCode: langObj.languageCode,
            },
            transaction,
            });

            if (existingLang) {
            existingLang.name = langObj.name;
            await existingLang.save({ transaction });
            } else {
            await this.variantCategoryLanguageRepo.create(
                {
                variantCategoryId: id,
                languageCode: langObj.languageCode,
                name: langObj.name,
                },
                { transaction },
            );
            }
        }
        }

        await transaction.commit();
        const message = this.i18n.translate('translation.updatedSuccefully', { lang });
        return { message };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
    }
}
