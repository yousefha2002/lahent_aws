import {BadRequestException,forwardRef,Inject,Injectable,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductImageService } from '../product_image/product_image.service';
import { Sequelize, Transaction, Op } from 'sequelize';
import { UpdateProductWithImageDto } from './dto/update-product-withImage.dto';
import { ExistingImage } from 'src/common/validation/parseAndValidateExistingImages';
import { CategoryService } from '../category/category.service';
import { ProductImage } from '../product_image/entities/product_image.entity';
import { OfferService } from '../offer/offer.service';
import { Category } from '../category/entities/category.entity';
import { ProductVariant } from '../prouduct_variant/entities/prouduct_variant.entity';
import { ProductExtra } from '../product_extra/entities/product_extra.entity';
import { ProductInstruction } from '../product_instruction/entities/product_instruction.entity';
import { Store } from '../store/entities/store.entity';
import { StoreStatus } from 'src/common/enums/store_status';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { ProductCategoryVariant } from '../product_category_variant/entities/product_category_variant.entity';
import { VariantCategory } from '../variant_category/entities/variant_category.entity';
import { ProductLanguage } from './entities/product_language.entity';
import { validateProductLanguages } from 'src/common/validation/product_language.validator';
import { ProductInstructionLanguage } from '../product_instruction/entities/product_instruction_language.dto';
import { ProductExtraLanguage } from '../product_extra/entities/product_extra_language.entity';
import { VariantCategoryLanguage } from '../variant_category/entities/variant_category_language.entity';
import { ProductVariantLanguage } from '../prouduct_variant/entities/product_variant_language.entity';
import { CategoryLanguage } from '../category/entities/category_language.entity';

@Injectable()
export class ProductService {
  constructor(
    @Inject(repositories.product_repository)
    private productRepo: typeof Product,
    @Inject(repositories.product_language_repository)
    private productLanguageRepo: typeof ProductLanguage,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productImageService: ProductImageService,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => OfferService))
    private offerService: OfferService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly i18n: I18nService,
  ) {}

  async countProductByCategory(categoryId: number) {
    return await this.productRepo.count({ where: { categoryId } });
  }

  async createProduct(
    storeId: number,
    dto: CreateProductDto,
    images: Express.Multer.File[],
    lang: Language = Language.en,
  ) {
    const transaction = await this.sequelize.transaction();
    const languages = validateProductLanguages(dto.languages);
    await this.categoryService.validateCategoryBelongsToStore(
      +dto.categoryId,
      storeId,
    );
    try {
      const product_number = await this.generateProductNumber(
        storeId,
        transaction,
      );
      const uploadedImages = await Promise.all(
        images.map(async (file) => {
          const result = await this.cloudinaryService.uploadImage(file);
          return {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
          };
        }),
      );
      const product = await this.productRepo.create(
        {
          storeId,
          categoryId: dto.categoryId,
          basePrice: parseFloat(dto.basePrice),
          preparationTime: parseInt(dto.preparationTime),
          product_number,
        },
        { transaction },
      );
      await this.productImageService.insertImagesForProduct(
        product.id,
        uploadedImages,
        transaction,
      );
      await Promise.all(
        languages.map((lang) =>
          this.productLanguageRepo.create(
            {
              productId: product.id,
              languageCode: lang.languageCode,
              name: lang.name,
              shortDescription: lang.shortDescription,
              longDescription: lang.longDescription,
            },
            { transaction },
          ),
        ),
      );
      await transaction.commit();

      return {
        message: this.i18n.translate('translation.product.created', { lang }),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateProductWithImages(
    productId: number,
    dto: UpdateProductWithImageDto,
    lang: Language = Language.en,
    existingImages: ExistingImage[],
    newImageFiles: Express.Multer.File[],
  ) {
    await this.productById(productId, lang);
    const transaction = await this.sequelize.transaction();

    const languages = validateProductLanguages(dto.languages); // زي createProduct

    try {
      // ✨ تحديث الحقول الأساسية للمنتج
      await this.productRepo.update(
        {
          basePrice: parseFloat(dto.basePrice),
          preparationTime: parseInt(dto.preparationTime),
        },
        { where: { id: productId }, transaction },
      );

      // ✨ تحديث الصور
      const currentImages = await this.productImageService.imagesForProduct(
        productId,
        transaction,
      );

      const imagePublicIdsToKeep = existingImages.map(
        (img) => img.imagePublicId,
      );
      const imagesToDelete = currentImages.filter(
        (img) => !imagePublicIdsToKeep.includes(img.imagePublicId),
      );

      for (const img of imagesToDelete) {
        await this.cloudinaryService.deleteImage(img.imagePublicId);
        await this.productImageService.deleteImage(img.id, transaction);
      }

      if (newImageFiles && newImageFiles.length > 0) {
        const uploadedImages = await Promise.all(
          newImageFiles.map((file) => this.cloudinaryService.uploadImage(file)),
        );
        const imagesData = uploadedImages.map((img) => ({
          productId,
          imageUrl: img.secure_url,
          imagePublicId: img.public_id,
        }));
        await this.productImageService.createMultiImage(
          imagesData,
          transaction,
        );
      }

      // ✨ تحديث اللغات
      for (const langItem of languages) {
        const exists = await this.productLanguageRepo.findOne({
          where: { productId, languageCode: langItem.languageCode },
          transaction,
        });

        if (exists) {
          // update existing language row
          await this.productLanguageRepo.update(
            {
              name: langItem.name,
              shortDescription: langItem.shortDescription,
              longDescription: langItem.longDescription,
            },
            { where: { id: exists.id }, transaction },
          );
        } else {
          // insert new language row
          await this.productLanguageRepo.create(
            {
              productId,
              languageCode: langItem.languageCode,
              name: langItem.name,
              shortDescription: langItem.shortDescription,
              longDescription: langItem.longDescription,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();
      return {
        message: this.i18n.translate('translation.product.updated', { lang }),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getCustomerStoreProducts(
    storeId: number,
    lang:Language,
    page: number,
    limit: number,
    categoryId?: number,
    name?: string,
  ) {
    const offset = (page - 1) * limit;

    const { rows: products, count } = await this.productRepo.findAndCountAll({
      where: {
        storeId,
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: [
        {
          model: Store,
          where: { status: StoreStatus.APPROVED },
          required: true,
        },
        { model: ProductImage, order: [['id', 'ASC']] },
        { model: Category },
        {model:ProductLanguage,where:{languageCode:lang,...(name ? { name: { [Op.like]: `%${name}%` } } : {})}}
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const final = await Promise.all(
      products.map(async (product) => {
        const offer = await this.offerService.getActiveOfferForProduct(
          product.id,
        );
        const finalPrice = offer
          ? this.offerService.getDiscountedPrice(product.basePrice, offer)
          : product.basePrice;

        return {
          ...product.toJSON(),
          images: product.images?.map((img) => img.imageUrl) || [],
          finalPrice,
          offer: offer || null,
        };
      }),
    );

    return {
      data: final,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
  }

  async getProductsByStore(
    storeId: number,
    lang:Language,
    page: number,
    limit: number,
    categoryId?: number,
    name?: string,
  ) {
    const offset = (page - 1) * limit;

    const { rows: products, count } = await this.productRepo.findAndCountAll({
      where: {
        storeId,
        ...(categoryId ? { categoryId } : {}),
      },
      include: [
        { model: ProductImage, order: [['id', 'ASC']] },
        { model: Category },
        {model:ProductLanguage,where:{languageCode:lang,...(name ? { name: { [Op.like]: `%${name}%` } } : {})}}
      ],
      limit,
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']],
    });

    const final = products.map((product) => ({
      ...product.toJSON(),
      images: product.images?.map((img) => img.imageUrl) || [],
    }));

    return {
      data: final,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
  }

  async productById(productId: number, lang: Language = Language.en) {
    const product = await this.productRepo.findByPk(productId);
    if (!product)
      throw new BadRequestException(
        this.i18n.translate('translation.product.not_found', { lang }),
      );
    return product;
  }

  async getFullProductDetails(productId: number,lang: Language,options?: { includeInactive?: boolean }) 
  {
    const { includeInactive = false } = options || {};

    const product = await this.productRepo.findOne({
      where: { id: productId, ...(includeInactive ? {} : { isActive: true }) },
      include: [
        {
          model: Store,
          required: true,
          ...(includeInactive ? {} : { where: { status: StoreStatus.APPROVED } }),
        },
        {
          model: ProductLanguage,
          where: { languageCode: lang },
        },
        { model: ProductImage, required: false, order: [['id', 'ASC']] },
        {
          model: ProductCategoryVariant,
          required: false,
          include: [
            {
              model: ProductVariant,
              required: false,
              ...(includeInactive ? {} : { where: { isActive: true } }),
              include: [
                {
                  model: ProductVariantLanguage,
                  where: { languageCode: lang },
                  required: false,
                },
              ],
            },
            {
              model: VariantCategory,
              required: true,
              include: [
                {
                  model: VariantCategoryLanguage,
                  where: { languageCode: lang },
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: ProductExtra,
          required: false,
          ...(includeInactive ? {} : { where: { isActive: true } }),
          include: [
            {
              model: ProductExtraLanguage,
              where: { languageCode: lang },
              required: false,
            },
          ],
        },
        {
          model: ProductInstruction,
          required: false,
          ...(includeInactive ? {} : { where: { isActive: true } }),
          include: [
            {
              model: ProductInstructionLanguage,
              where: { languageCode: lang },
              required: false,
            },
          ],
        },
        { model: Category, include: [{ model: CategoryLanguage, where: { languageCode: lang } }] },
      ],
    });

    if (!product) throw new BadRequestException('Product not found');

    const offer = await this.offerService.getActiveOfferForProduct(product.id);
    const finalPrice = offer
      ? this.offerService.getDiscountedPrice(product.basePrice, offer)
      : product.basePrice;

    return {
      ...product.toJSON(),
      finalPrice,
      images: product.images?.map((img) => img.imageUrl) || [],
      extras: product.extras || [],
      instructions: product.instructions || [],
      variantCategories: product.productCategoryVariants?.map(catVar => ({
        id: catVar.variantCategory.id,
        languages: catVar.variantCategory.languages || [],
        variants: catVar.variants?.map(v => ({
          ...v.toJSON(),
          languages: v.langauges || []
        })) || []
      })) || [],
      offer: offer || null,
    };
  }

  async changeProductActivity(
    productId: number,
    storeId: number,
    lang: Language = Language.en,
  ) {
    const product = await this.productById(productId, lang);
    if (product.storeId !== storeId)
      throw new BadRequestException(
        this.i18n.translate('translation.product.no_permission', { lang }),
      );
    product.isActive = !product.isActive;
    await product.save();
    return {
      message: this.i18n.translate('translation.product.activity_changed', {
        lang,
      }),
    };
  }

  async validateProductsExistence(
    productIds: number[],
    storeId: number,
    lang: Language = Language.en,
  ) {
    const count = await this.productRepo.count({
      where: { id: productIds, storeId },
    });
    if (count !== productIds.length)
      throw new BadRequestException(
        this.i18n.translate('translation.not_found', { lang }),
      );
  }

  async generateProductNumber(storeId: number, transaction?: any) {
    const result = await this.productRepo.findOne({
      where: { storeId },
      attributes: [
        [
          Sequelize.fn('MAX', Sequelize.col('product_number')),
          'maxProductNumber',
        ],
      ],
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });
    const maxProductNumber = result?.getDataValue('maxProductNumber') ?? 0;
    return +maxProductNumber + 1;
  }

  async incrementSales(
    productId: number,
    quantity: number,
    transaction?: Transaction,
  ) {
    await this.productRepo.increment(
      { sales: quantity },
      { where: { id: productId }, transaction },
    );
  }
}
