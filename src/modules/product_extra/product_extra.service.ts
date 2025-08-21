import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductExtra } from './entities/product_extra.entity';
import { extraItemType } from 'src/common/types/extraItem.type';
import { Transaction } from 'sequelize';
import { UpdateProductExtraDto } from './dto/update-extra-product.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class ProductExtraService {
  constructor(
    @Inject(repositories.productExtra_repository)
    private productExtraRepo: typeof ProductExtra,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
  ) {}

  async instertExtraForProduct(
    productId: number,
    extras: extraItemType[],
    transaction: Transaction,
  ) {
    await this.productExtraRepo.bulkCreate(
      extras.map((item) => ({
        productId,
        name: item.name,
        price: item.price,
      })),
      { transaction },
    );
  }

  async findExistingExtras(extras: number[], productId: number) {
    const existingExtras = await this.productExtraRepo.findAll({
      where: { id: extras, productId: productId },
      attributes: ['id'],
    });
    return existingExtras;
  }

  async updateExtraProduct(extraId: number, dto: UpdateProductExtraDto) {
    const [extra, product] = await Promise.all([
      this.productExtraRepo.findByPk(extraId),
      this.productService.productById(dto.productId),
    ]);
    if (!extra || extra.productId !== dto.productId) {
      throw new BadRequestException('Extra Product not found');
    }
    const data = {
      name: dto.name,
      price: dto.price,
    };
    Object.assign(extra, data);
    await extra.save();
    return { message: 'updated successed' };
  }

  async updateIsActive(extraId: number, isActive: boolean) {
    const extra = await this.productExtraRepo.findByPk(extraId);
    if (!extra) {
      throw new BadRequestException('Extra Product not found');
    }
    extra.isActive = isActive;
    await extra.save();
    return { message: 'active status updated' };
  }

  async deleteExtraProduct(extraId: number) {
    await this.productExtraRepo.destroy({ where: { id: extraId } });
    return { message: 'deleted successed' };
  }

  async createSingleExtraItem(dto: UpdateProductExtraDto) {
    await this.productService.productById(dto.productId);
    const extraCreated = await this.productExtraRepo.create({
      name: dto.name,
      price: dto.price,
      productId: dto.productId,
    });
    return extraCreated;
  }
}
