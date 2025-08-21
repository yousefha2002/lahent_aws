import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { extraItemType } from 'src/common/types/extraItem.type';
import { variantType } from 'src/common/types/variant.type';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductImageService } from '../product_image/product_image.service';
import { ProductInstructionService } from '../product_instruction/product_instruction.service';
import { ProductExtraService } from '../product_extra/product_extra.service';
import { ProuductVariantService } from '../prouduct_variant/prouduct_variant.service';
import { Sequelize, Transaction, Op } from 'sequelize';
import { UpdateProductWithImageDto } from './dto/update-product-withImage.dto';
import { ExistingImage } from 'src/common/validation/parseAndValidateExistingImages';
import { UpdateProductWithIcategoryDto } from './dto/update-product-withCategory.dto';
import { CategoryService } from '../category/category.service';
import { ProductImage } from '../product_image/entities/product_image.entity';
import { OfferService } from '../offer/offer.service';
import { Category } from '../category/entities/category.entity';
import { ProductVariant } from '../prouduct_variant/entities/prouduct_variant.entity';
import { ProductExtra } from '../product_extra/entities/product_extra.entity';
import { ProductInstruction } from '../product_instruction/entities/product_instruction.entity';
import { Store } from '../store/entities/store.entity';
import { StoreStatus } from 'src/common/enums/store_status';
import { VariantFileWithIndex } from 'src/common/types/varientFileWithIndex.type';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class ProductService {
  constructor(
    @Inject(repositories.product_repository)
    private productRepo: typeof Product,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productImageService: ProductImageService,
    @Inject(forwardRef(() => ProuductVariantService))
    private prouductVariantService: ProuductVariantService,
    @Inject(forwardRef(() => ProductInstructionService))
    private productInstructionService: ProductInstructionService,
    @Inject(forwardRef(() => ProductExtraService))
    private productExtraService: ProductExtraService,
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
    extraItems: extraItemType[],
    variants: variantType[],
    variantFilesWithIndex: VariantFileWithIndex[],
    lang: Language = Language.en,
  ) {
    const transaction = await this.sequelize.transaction();
    await this.categoryService.validateCategoryBelongsToStore(
      +dto.categoryId,
      storeId,
    );
    try {
      const variantsWithImages = await Promise.all(
        variants.map(async (variant, index) => {
          const fileEntry = variantFilesWithIndex.find(v => v.index === index);
          if (fileEntry) {
            const result = await this.cloudinaryService.uploadImage(fileEntry.file);
            return { ...variant, imageUrl: result.secure_url, imagePublicId: result.public_id };
          }
          return variant;
        }),
      );

      const uploadedImages = await Promise.all(
        images.map(async file => {
          const result = await this.cloudinaryService.uploadImage(file);
          return { imageUrl: result.secure_url, imagePublicId: result.public_id };
        }),
      );

      const newProduct = await this.creationofProduct(dto, storeId, transaction);
      await Promise.all([
        this.productImageService.insertImagesForProduct(newProduct.id, uploadedImages, transaction),
        dto.specialChanges
          ? this.productInstructionService.insertInstructionsForProduct(newProduct.id, dto.specialChanges, transaction)
          : Promise.resolve(),
        this.productExtraService.instertExtraForProduct(newProduct.id, extraItems, transaction),
        this.prouductVariantService.insertVariantsForProduct(newProduct.id, variantsWithImages, transaction),
      ]);

      await transaction.commit();

      return { message: this.i18n.translate('translation.product.created', { lang }) };
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

    const updatedFields = {
      name: dto.name,
      longDescription: dto.longDescription,
      shortDescription: dto.shortDescription,
    };
    try {
      await this.productRepo.update(updatedFields, { where: { id: productId }, transaction });

      const currentImages = await this.productImageService.imagesForProduct(productId, transaction);

      const imagePublicIdsToKeep = existingImages.map(img => img.imagePublicId);
      const imagesToDelete = currentImages.filter(img => !imagePublicIdsToKeep.includes(img.imagePublicId));

      for (const img of imagesToDelete) {
        await this.cloudinaryService.deleteImage(img.imagePublicId);
        await this.productImageService.deleteImage(img.id, transaction);
      }

      if (newImageFiles && newImageFiles.length > 0) {
        const uploadedImages = await Promise.all(newImageFiles.map(file => this.cloudinaryService.uploadImage(file)));
        const imagesData = uploadedImages.map(img => ({ productId, imageUrl: img.secure_url, imagePublicId: img.public_id }));
        await this.productImageService.createMultiImage(imagesData, transaction);
      }

      await transaction.commit();
      return { message: this.i18n.translate('translation.product.updated', { lang }) };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async creationofProduct(dto: CreateProductDto, storeId: number, transaction: Transaction) {
    const product_number = await this.generateProductNumber(storeId, transaction);
    return await this.productRepo.create(
      {
        categoryId: dto.categoryId,
        storeId,
        name: dto.name,
        longDescription: dto.longDescription,
        shortDescription: dto.shortDescription,
        basePrice: dto.basePrice,
        preparationTime: dto.preparationTime,
        product_number,
      },
      { transaction },
    );
  }

  async getCustomerStoreProducts(
    storeId: number,
    page: number,
    limit: number,
    categoryId?: number,
    name?: string,
    lang: Language = Language.en,
  ) {
    const offset = (page - 1) * limit;

    const { rows: products, count } = await this.productRepo.findAndCountAll({
      where: {
        storeId,
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [
        { model: Store, where: { status: StoreStatus.APPROVED }, required: true },
        { model: ProductImage, order: [['id', 'ASC']] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const final = await Promise.all(
      products.map(async product => {
        const offer = await this.offerService.getActiveOfferForProduct(product.id);
        const finalPrice = offer ? this.offerService.getDiscountedPrice(product.basePrice, offer) : product.basePrice;

        return {
          ...product.toJSON(),
          images: product.images?.map(img => img.imageUrl) || [],
          finalPrice,
          offer: offer || null,
        };
      }),
    );

    return { data: final, totalPages: Math.ceil(count / limit), totalItems: count };
  }

  async getProductsByStore(
    storeId: number,
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
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [
        { model: ProductImage, order: [['id', 'ASC']] },
        { model: Category },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const final = products.map(product => ({
      ...product.toJSON(),
      images: product.images?.map(img => img.imageUrl) || [],
      categoryName: product.category?.title || null,
    }));

    return { data: final, totalPages: Math.ceil(count / limit), totalItems: count };
  }

  async updateProductWithCategory(productId: number, dto: UpdateProductWithIcategoryDto, storeId: number) {
    await this.categoryService.validateCategoryBelongsToStore(dto.categoryId, storeId);
    const product = await this.productById(productId);
    product.categoryId = dto.categoryId;
    product.basePrice = dto.basePrice;
    product.preparationTime = dto.preparationTime;
    product.shortDescription = dto.shortDescription;
    product.longDescription = dto.longDescription;
    await product.save();
    return { message: 'product updated' };
  }

  async productById(productId: number, lang: Language = Language.en) {
    const product = await this.productRepo.findByPk(productId);
    if (!product) throw new BadRequestException(this.i18n.translate('translation.product.not_found', { lang }));
    return product;
  }

  async getFullProductDetails(productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId, isActive: true },
      include: [
        { model: Store, where: { status: StoreStatus.APPROVED }, required: true },
        { model: ProductImage, required: false, order: [['id', 'ASC']] },
        { model: ProductVariant, required: false },
        { model: ProductExtra, required: false },
        { model: ProductInstruction, required: false },
        { model: Category, required: false },
      ],
    });

    if (!product) throw new BadRequestException('Product not found');

    const offer = await this.offerService.getActiveOfferForProduct(product.id);
    const finalPrice = offer ? this.offerService.getDiscountedPrice(product.basePrice, offer) : product.basePrice;

    return {
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      preparationTime: product.preparationTime,
      basePrice: product.basePrice,
      finalPrice,
      isActive: product.isActive,
      sales: product.sales,
      product_number: product.product_number,
      categoryName: product.category?.title ?? null,
      images: product.images?.map(img => img.imageUrl) || [],
      variants: product.variants || [],
      extras: product.extras || [],
      instructions: product.instructions || [],
      offer: offer || null,
    };
  }

  async changeProductActivity(productId: number, storeId: number, newStatus: boolean, lang: Language = Language.en) {
    const product = await this.productById(productId, lang);
    if (product.storeId !== storeId) throw new BadRequestException(this.i18n.translate('translation.product.no_permission', { lang }));
    product.isActive = newStatus;
    await product.save();
    return { message: this.i18n.translate('translation.product.activity_changed', { lang }) };
  }

  async validateProductsExistence(productIds: number[],storeId:number, lang: Language = Language.en) {
    const count = await this.productRepo.count({ where: { id: productIds,storeId } });
    if (count !== productIds.length) throw new BadRequestException(this.i18n.translate('translation.not_found', { lang }));
  }

  async generateProductNumber(storeId: number, transaction?: any) {
    const result = await this.productRepo.findOne({
      where: { storeId },
      attributes: [[Sequelize.fn('MAX', Sequelize.col('product_number')), 'maxProductNumber']],
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });
    const maxProductNumber = result?.getDataValue('maxProductNumber') ?? 0;
    return +maxProductNumber + 1;
  }

  async incrementSales(productId: number, quantity: number, transaction?: Transaction) {
    await this.productRepo.increment({ sales: quantity }, { where: { id: productId }, transaction });
  }
}