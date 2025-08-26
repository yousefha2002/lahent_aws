import { ProductService } from './../product/product.service';
import {
  BadGatewayException,
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Op, Sequelize } from 'sequelize';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { CategoryLanguage } from './entities/category_language.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { validateRequiredLanguages, validateUniqueLanguages } from 'src/common/utils/validateLanguages';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(repositories.category_repository) private categoryRepo: typeof Category,
    @Inject(repositories.category_langauge_repository) private categoryLanguageRepo: typeof CategoryLanguage,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private readonly i18n: I18nService, 
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {}

  async create(storeId: number,dto: CreateCategoryDto,lang: Language = Language.en) 
  {
    const transaction = await this.sequelize.transaction();
    const codes = dto.languages.map(l => l.languageCode);
    validateRequiredLanguages(codes, 'category languages');
    try {
      const category = await this.categoryRepo.create(
        { storeId },
        { transaction }
      );

      for (const langObj of dto.languages) {
        await this.verifyNameWithStore(storeId,langObj.title,undefined,langObj.languageCode as Language,);

        await this.categoryLanguageRepo.create(
          {
            title: langObj.title,
            languageCode: langObj.languageCode,
            categoryId:category.id
          },
          { transaction }
        );
      }

      await transaction.commit();
      const message = this.i18n.translate('translation.category.created', { lang });
      return { message };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(categoryId: number,storeId: number,dto: UpdateCategoryDto,lang: Language) 
  {
      const transaction = await this.sequelize.transaction();
      try {
        const category = await this.validateCategoryBelongsToStore(categoryId, storeId, lang);
        if(dto.languages)
        {
          const codes = dto.languages.map(l => l.languageCode);
          validateUniqueLanguages(codes, 'category languages');
          for (const langObj of dto.languages) {
            await this.verifyNameWithStore(
              storeId,
              langObj.title,
              categoryId,
              langObj.languageCode as Language,
            );
            const existingLang = await this.categoryLanguageRepo.findOne({
              where: {
                categoryId,
                languageCode: langObj.languageCode,
              },
              transaction,
            });

            if (existingLang) {
              existingLang.title = langObj.title;
              await existingLang.save({ transaction });
            } else {
              await this.categoryLanguageRepo.create(
                {
                  title: langObj.title,
                  languageCode: langObj.languageCode,
                  categoryId: category.id,
                },
                { transaction }
              );
            }
          }
        }

        await transaction.commit();
        const message = this.i18n.translate('translation.category.updated', { lang });
        return { message };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

  async verifyNameWithStore(storeId: number,title: string,categoryId?: number,lang: Language = Language.en) 
  {
    const where: any = { storeId };
    if (categoryId) {
      where.id = { [Op.ne]: categoryId };
    }

    const category = await this.categoryRepo.findOne({
      where,
      include: [
        {
          model: CategoryLanguage,
          where: { title, languageCode: lang },
          required: true, // لازم يكون مطابق
        },
      ],
    });

    if (category) {
      const message = this.i18n.translate('translation.category.name_exists', { lang });
      throw new BadGatewayException(message);
    }

    return true;
  }

  async deleteCategory(categoryId: number, storeId: number, lang: Language = Language.en) {
    const productCount = await this.productService.countProductByCategory(categoryId);
    if (productCount > 0) {
      const message = this.i18n.translate('translation.category.has_products', { lang });
      throw new BadRequestException(message);
    }
    await this.categoryRepo.destroy({ where: { id: categoryId, storeId } });
    const message = this.i18n.translate('translation.category.deleted', { lang });
    return { message };
  }

  async categoryById(categoryId: number | string, lang: Language = Language.en) {
    const category = await this.categoryRepo.findByPk(categoryId,{include:{model:CategoryLanguage,where: { languageCode: lang }}});
    if (!category) {
      const message = this.i18n.translate('translation.category.not_found', { lang });
      throw new BadRequestException(message);
    }
    return category;
  }

  async getCategoriesWithProductCount(storeId: number,lang:Language) {
    const categories = await this.categoryRepo.findAll({
      where: { storeId },
      include:[{model:CategoryLanguage,where:{languageCode:lang}}],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM products AS product
              WHERE product.categoryId = Category.id
            )`),
            'productCount',
          ],
        ],
      },
    });

    return categories.map(category => ({
      ...category.toJSON(),
      productCount: Number(category.getDataValue('productCount')),
    }));
  }

  async validateCategoryBelongsToStore(
    categoryId: number,
    storeId: number,
    lang: Language = Language.en
  ) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, storeId },
    });

    if (!category) {
      const message = this.i18n.translate('translation.category.not_belong_to_store', { lang });
      throw new BadRequestException(message);
    }

    return category;
  }

  async validateCategoriesExistence(categoryIds: number[],storeId:number, lang: Language = Language.en) {
    const count = await this.categoryRepo.count({
      where: { id: categoryIds ,storeId}
    });
    if (count !== categoryIds.length) {
      const message = this.i18n.translate('translation.category.not_found_some', { lang });
      throw new BadRequestException(message);
    }
  }
}
