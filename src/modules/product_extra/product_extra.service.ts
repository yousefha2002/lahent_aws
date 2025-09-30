import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductExtra } from './entities/product_extra.entity';
import { extraItemType } from 'src/common/types/extraItem.type';
import { UpdateProductExtraDto } from './dto/update-extra-product.dto';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { CreateProductExtraDto } from './dto/create-product-extra.dto';
import { Sequelize } from 'sequelize';
import { ProductExtraLanguage } from './entities/product_extra_language.entity';
import { validateRequiredLanguages, validateUniqueLanguages } from 'src/common/validators/translation-validator.';

@Injectable()
export class ProductExtraService {
  constructor(
    @Inject(repositories.productExtra_repository) private productExtraRepo: typeof ProductExtra,
    @Inject(repositories.productExtraLanguage_repository) private productExtraLanguageRepo: typeof ProductExtraLanguage,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {}

    async createProductExtras(dto: CreateProductExtraDto,storeId:number)
    {
      const product = await this.productService.productById(dto.productId);
      if(product.storeId!==storeId)
      {
        throw new BadRequestException('Invalid Process');
      }
      const transaction = await this.sequelize.transaction();

      try {
        for (const extra of dto.extras) {
          const codes = extra.languages.map(l => l.languageCode);
          validateRequiredLanguages(codes, 'product extra languages');
          const createdExtra = await this.productExtraRepo.create(
            {
              productId: dto.productId,
              additionalPrice: extra.additionalPrice,
            },
            { transaction }
          );

          await Promise.all(
            extra.languages.map(lang =>
              this.productExtraLanguageRepo.create(
                {
                  productExtraId: createdExtra.id,
                  languageCode: lang.languageCode,
                  name: lang.name,
                },
                { transaction }
              )
            )
          );
        }

        await transaction.commit();
        return { message: 'Product extras created successfully' };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

  async updateExtraProduct(extraId: number,dto: UpdateProductExtraDto,storeId: number) 
  {
    const [extra, product] = await Promise.all([
      this.productExtraRepo.findByPk(extraId, { include: [ProductExtraLanguage] }),
      this.productService.productById(dto.productId),
    ]);

    if (!extra || extra.productId !== dto.productId) {
      throw new BadRequestException('Extra Product not found');
    }

    if (product.storeId !== storeId) {
      throw new BadRequestException('Invalid Process');
    }

    if (dto.additionalPrice !== undefined) {
      extra.additionalPrice = dto.additionalPrice;
      await extra.save();
    }

    if (dto.languages && Array.isArray(dto.languages)) {
      const codes = dto.languages.map(l => l.languageCode);
      validateUniqueLanguages(codes, 'product extra languages');
      for (const langDto of dto.languages) {
        const langEntry = extra.languages.find(l => l.languageCode === langDto.languageCode);
        if (langEntry) {
          langEntry.name = langDto.name;
          await langEntry.save();
        } else {
          await this.productExtraLanguageRepo.create({
            productExtraId: extra.id,
            languageCode: langDto.languageCode,
            name: langDto.name,
          });
        }
      }
    }

    return { message: 'Product extra updated successfully' };
  }

  async updateIsActive(extraId: number, storeId: number) {
    const extra = await this.productExtraRepo.findByPk(extraId, {
      include: [{ model: Product }],
    });
    if (!extra) {
      throw new BadRequestException('Extra Product not found');
    }
    if (extra.product.storeId !== storeId) {
      throw new BadRequestException('Invalid Process');
    }
    extra.isActive = !extra.isActive;
    await extra.save();
    return { message: 'active status updated' };
  }


  async findExistingExtras(extras: number[], productId: number) {
    const existingExtras = await this.productExtraRepo.findAll({
      where: { id: extras, productId: productId },
      attributes: ['id'],
    });
    return existingExtras;
  }
}
