import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductImage } from './entities/product_image.entity';
import { Transaction } from 'sequelize';

@Injectable()
export class ProductImageService {
  constructor(
    @Inject(repositories.productImage_repository)
    private productImageRepo: typeof ProductImage,
  ) {}

  async insertImagesForProduct(
    productId: number,
    images: { imageUrl: string; imagePublicId: string }[],
    transaction: Transaction,
  ) {
    await this.productImageRepo.bulkCreate(
      images.map((img) => ({
        productId,
        imageUrl: img.imageUrl,
        imagePublicId: img.imagePublicId,
      })),
      { transaction },
    );
  }

  async createMultiImage(
    images: { imageUrl: string; imagePublicId: string; productId: number }[],
    transaction: Transaction,
  ) {
    return this.productImageRepo.bulkCreate(images, { transaction });
  }

  async imagesForProduct(productId: number, transaction: Transaction) {
    return this.productImageRepo.findAll({ where: { productId }, transaction });
  }

  async deleteImage(imageId: number, transaction: Transaction) {
    return this.productImageRepo.destroy({
      where: { id: imageId },
      transaction,
    });
  }
}
