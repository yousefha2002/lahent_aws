import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductVariant } from './entities/prouduct_variant.entity';
import { variantType } from 'src/common/types/variant.type';
import { Transaction } from 'sequelize';
import { ProductService } from '../product/product.service';
import { CreateProductVariantDto } from './dto/create-variant.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProuductVariantService {
  constructor(
    @Inject(repositories.productVariant_repository)
    private productVariantRepo: typeof ProductVariant,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async insertVariantsForProduct(
    productId: number,
    variants: variantType[],
    transaction: Transaction,
  ) {
    await this.productVariantRepo.bulkCreate(
      variants.map((item) => ({
        productId,
        name: item.name,
        type: item.type,
        priceDiff: item.price,
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId,
      })),
      { transaction },
    );
  }

  async findExistingVariants(variants: number[], productId: number) {
    const existingVariants = await this.productVariantRepo.findAll({
      where: { id: variants, productId: productId },
      attributes: ['id'],
    });
    return existingVariants;
  }

  async updateVarianteProduct(
    variantId: number,
    dto: CreateProductVariantDto,
    file?: Express.Multer.File,
  ) {
    const [variant, product] = await Promise.all([
      this.productVariantRepo.findByPk(variantId),
      this.productService.productById(dto.productId),
    ]);
    if (!variant || variant.productId !== dto.productId) {
      throw new BadRequestException('Variant Product not found');
    }
    if (file) {
      if (variant.imageUrl) {
        await this.cloudinaryService.deleteImage(variant.imagePublicId);
      }
      const result = await this.cloudinaryService.uploadImage(file);
      variant.imageUrl = result.secure_url;
      variant.imagePublicId = result.public_id;
    }
    const data = {
      name: dto.name,
      priceDiff: dto.price,
      type: dto.type,
    };
    Object.assign(variant, data);
    await variant.save();
    return { message: 'updated successed' };
  }

  async updateIsActive(variantId: number, isActive: boolean) {
    const variant = await this.productVariantRepo.findByPk(variantId);
    if (!variant) {
      throw new BadRequestException('Variant Product not found');
    }
    variant.isActive = isActive;
    await variant.save();
    return { message: 'active status updated' };
  }

  async deleteVariantProduct(variantId: number) {
    const variant = await this.productVariantRepo.findByPk(variantId);
    if (!variant) {
      throw new BadRequestException('Invalid variant');
    }
    await this.cloudinaryService.deleteImage(variant.imagePublicId);
    await variant.destroy();
    return { message: 'deleted successed' };
  }

  async validateProductVariantsSelection(
    productId: number,
    selectedVariantIds: number[],
  ) {
    const productVariants = await this.productVariantRepo.findAll({
      where: { productId, isActive: true },
    });

    const variantsByType = productVariants.reduce(
      (acc, variant) => {
        if (!acc[variant.type]) acc[variant.type] = [];
        acc[variant.type].push(variant.id);
        return acc;
      },
      {} as Record<string, number[]>,
    );

    const selectedSet = new Set(selectedVariantIds || []);

    for (const [type, variantIds] of Object.entries(variantsByType)) {
      const selectedOfType = variantIds.filter((id) => selectedSet.has(id));

      if (selectedOfType.length !== 1) {
        throw new BadRequestException(
          `You must select exactly one variant for type: ${type}`,
        );
      }
    }
  }

  async createSingleVariant(
    dto: CreateProductVariantDto,
    file: Express.Multer.File,
  ) {
    await this.productService.productById(dto.productId);
    const result = await this.cloudinaryService.uploadImage(file);
    const variantCreated = await this.productVariantRepo.create({
      name: dto.name,
      priceDiff: dto.price,
      type: dto.type,
      productId: dto.productId,
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });
    return variantCreated;
  }
}
