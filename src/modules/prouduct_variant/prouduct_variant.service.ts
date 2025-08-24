import { VariantCategoryService } from './../variant_category/variant_category.service';
import { ProductCategoryVariantService } from './../product_category_variant/product_category_variant.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductVariant } from './entities/prouduct_variant.entity';
import { ProductService } from '../product/product.service';
import {CreateProductVariantsDto } from './dto/create-variant.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductCategoryVariant } from '../product_category_variant/entities/product_category_variant.entity';
import { Product } from '../product/entities/product.entity';
import { UpdateProductVariantDto } from './dto/update-variant.dto';
import { ProductVariantLanguage } from './entities/product_variant_language.entity';
import { Sequelize } from 'sequelize';
import { validateAndParseVariants } from 'src/common/validation/validate_variants';
import { validateVariantLanguages } from 'src/common/validation/variant_language.validator';

@Injectable()
export class ProuductVariantService {
  constructor(
    @Inject(repositories.productVariant_repository) private productVariantRepo: typeof ProductVariant,
    @Inject(repositories.productVariantLanguage_repository) private productVariantLanguageRepo: typeof ProductVariantLanguage,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productCategoryVariantService: ProductCategoryVariantService,
    private readonly variantCategoryService: VariantCategoryService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {}

  async updateVarianteProduct(variantId: number,storeId: number,dto: UpdateProductVariantDto,file?: Express.Multer.File) 
  {
    const variant = await this.productVariantRepo.findByPk(variantId, {
      include: [
        {
          model: ProductCategoryVariant,
          include: [{ model: Product }],
        },
      ],
    });

    if (!variant || variant.productCategoryVariant?.product?.storeId !== storeId) {
      throw new BadRequestException(
        'Variant not found or you are not allowed to edit it',
      );
    }

    if (file) {
      if (variant.imageUrl) {
        await this.cloudinaryService.deleteImage(variant.imagePublicId);
      }
      const result = await this.cloudinaryService.uploadImage(file);
      variant.imageUrl = result.secure_url;
      variant.imagePublicId = result.public_id;
    }

    variant.additional_price = dto.additional_price;

    if (dto.languages) {
      const parsedLanguages = validateVariantLanguages(dto.languages);

      const existingLanguages = await this.productVariantLanguageRepo.findAll({
        where: { productVariantId: variant.id },
      });

      for (const lang of parsedLanguages) {
        const existing = existingLanguages.find(
          (el) => el.languageCode === lang.languageCode,
        );

        if (existing) {
          existing.name = lang.name;
          await existing.save();
        } else {
          await this.productVariantLanguageRepo.create({
            productVariantId: variant.id,
            languageCode: lang.languageCode,
            name: lang.name,
          });
        }
      }
    }
      await variant.save();

      return { message: 'Variant updated successfully' };
  }

  async updateIsActive(variantId: number, storeId: number) {
    const variant = await this.productVariantRepo.findByPk(variantId, {
      include: [
        {
          model: ProductCategoryVariant,
          include: [
            {
              model: Product,
            },
          ],
        },
      ],
    });
    if (!variant) {
      throw new BadRequestException('Variant Product not found');
    }
    if (variant.productCategoryVariant.product.storeId !== storeId) {
      throw new BadRequestException('Invalid Process');
    }
    variant.isActive = !variant.isActive;
    await variant.save();
    return { message: 'active status updated' };
  }

  async createMultipleVariants(body:CreateProductVariantsDto,files: Record<string, Express.Multer.File>,storeId: number) {
    const transaction = await this.sequelize.transaction();
    const {variants,productId} = body
    const parsedVariants = validateAndParseVariants(variants);
    try {
      // جلب المنتج والتأكد من ملكية الـ store
      const product = await this.productService.productById(+productId);
      if (product.storeId !== storeId) {
        throw new BadRequestException('You can only add variants to your own store products');
      }
      for (let i = 0; i < parsedVariants.length; i++) {
        const variantDto = parsedVariants[i];

        // التحقق من الفئة
        await this.variantCategoryService.findOne(+variantDto.categoryId);
        const [productCategoryVariant] =
          await this.productCategoryVariantService.findOrCreate(
            +productId,
            variantDto.categoryId,
            transaction  
          );

        // رفع الصورة
        const fileKey = `image_${i}`;
        let imageUrl: string | undefined;
        let imagePublicId: string | undefined;

        if (files[fileKey]) {
          const result = await this.cloudinaryService.uploadImage(files[fileKey]);
          imageUrl = result.secure_url;
          imagePublicId = result.public_id;
        }

        // إنشاء الفاريانت
        const variantCreated = await this.productVariantRepo.create(
          {
            productId,
            productCategoryVariantId: productCategoryVariant.id,
            additional_price: variantDto.additional_price,
            imageUrl,
            imagePublicId,
          },
          { transaction }
        );

        // إنشاء اللغات لكل فاريانت ضمن الـ transaction
        if (variantDto.languages && variantDto.languages.length > 0) {
          await Promise.all(
            variantDto.languages.map((lang) =>
              this.productVariantLanguageRepo.create(
                {
                  productVariantId: variantCreated.id,
                  languageCode: lang.languageCode,
                  name: lang.name,
                },
                { transaction }
              )
            )
          );
        }
      }

      // commit بعد نجاح كل العمليات
      await transaction.commit();
      return { message: 'Variants have been created successfully' };

    } catch (error) {
      // rollback عند حدوث أي خطأ
      await transaction.rollback();
      throw error;
    }
  }

  async findExistingVariants(variants: number[], productId: number) {
    const existingVariants = await this.productVariantRepo.findAll({
      include: [
        {
          model: ProductCategoryVariant,
          where: { productId },
          attributes: ['id'],
        },
      ],
      where: { id: variants },
      attributes: ['id'],
    });
    return existingVariants;
  }

  async validateProductVariantsSelection(
    productId: number,
    selectedVariantIds: number[],
  ) {
    // جلب جميع الفاريانتس الفعّالة الخاصة بالمنتج عبر الـ ProductCategoryVariant
    const productVariants = await this.productVariantRepo.findAll({
      include: [
        {
          model: ProductCategoryVariant,
          where: { productId },
          attributes: ['id', 'productId'],
        },
      ],
      where: { isActive: true },
    });

    // تجميع الفاريانتس حسب ProductCategoryVariantId
    const variantsByCategory = productVariants.reduce(
      (acc, variant) => {
        const categoryId = variant.productCategoryVariantId;
        if (!acc[categoryId]) acc[categoryId] = [];
        acc[categoryId].push(variant.id);
        return acc;
      },
      {} as Record<number, number[]>,
    );

    const selectedSet = new Set(selectedVariantIds || []);

    // التحقق: يجب اختيار فاريانت واحد فقط لكل Category
    for (const [categoryIdStr, variantIds] of Object.entries(
      variantsByCategory,
    )) {
      const categoryId = Number(categoryIdStr);
      const selectedForCategory = variantIds.filter((id) =>
        selectedSet.has(id),
      );
      if (selectedForCategory.length !== 1) {
        throw new BadRequestException(
          `You must select exactly one variant for category ID: ${categoryId}`,
        );
      }
    }
  }
}