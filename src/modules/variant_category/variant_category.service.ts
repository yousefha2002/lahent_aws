import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { VariantCategory } from './entities/variant_category.entity';
import { Sequelize } from 'sequelize';
import { VariantCategoryLanguage } from './entities/variant_category_language.entity';
import { CreateVariantCategoryDto } from './dto/create_variant_category.dto';
import { Language } from 'src/common/enums/language';

@Injectable()
export class VariantCategoryService {
    constructor(
        @Inject(repositories.variant_category_repository) private variantCategoryRepo: typeof VariantCategory,
        @Inject(repositories.variant_category_language_repository) private variantCategoryLanguageRepo: typeof VariantCategoryLanguage,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize
    ){}

    async create(createDto: CreateVariantCategoryDto) 
    {
        const { languages } = createDto;

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

        // commit transaction
        await t.commit();

        return { ...category.toJSON(), languages: categoryLanguages };
        } catch (error) {
        await t.rollback();
        throw error;
        }
    }

    getAll(lang:Language)
    {
        return this.variantCategoryRepo.findAll({include:[{model:VariantCategoryLanguage,where:{languageCode:lang},required:false}]})
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
}
