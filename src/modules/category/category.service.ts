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

@Injectable()
export class CategoryService {
  constructor(
    @Inject(repositories.category_repository)
    private categoryRepo: typeof Category,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private readonly i18n: I18nService, // إضافة i18n
  ) {}

  async create(storeId: number, dto: CreateCategoryDto, lang: Language = Language.en) {
    await this.verifyNameWithStore(storeId, dto.title, undefined, lang);
    await this.categoryRepo.create({ storeId, title: dto.title });
    const message = this.i18n.translate('translation.category.created', { lang });
    return { message };
  }

  async update(
    dto: CreateCategoryDto,
    categoryId: number,
    storeId: number,
    lang: Language = Language.en
  ) {
    const category = await this.validateCategoryBelongsToStore(categoryId, storeId, lang);
    await this.verifyNameWithStore(category.storeId, dto.title, categoryId, lang);
    category.title = dto.title;
    await category.save();
    const message = this.i18n.translate('translation.category.updated', { lang });
    return { message };
  }

  async verifyNameWithStore(
    storeId: number,
    title: string,
    categoryId?: number,
    lang: Language = Language.en
  ) {
    const where: any = { storeId, title };
    if (categoryId) {
      where.id = { [Op.ne]: categoryId };
    }
    const category = await this.categoryRepo.findOne({ where });
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
    const category = await this.categoryRepo.findByPk(categoryId);
    if (!category) {
      const message = this.i18n.translate('translation.category.not_found', { lang });
      throw new BadRequestException(message);
    }
    return category;
  }

  async getCategoriesWithProductCount(storeId: number) {
    const categories = await this.categoryRepo.findAll({
      where: { storeId },
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
      id: category.id,
      title: category.title,
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
