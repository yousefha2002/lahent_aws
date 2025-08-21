import {Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OfferProduct } from './entites/offer_product.entity';

@Injectable()
export class OfferProductService {
  constructor(
    @Inject(repositories.offer_product_repository)
    private offerProductRepo: typeof OfferProduct,
  ) {}

  async linkProductsToOffer(offerId: number, productIds: number[]) {
    const records = productIds.map(productId => ({
      offerId,
      productId,
    }));
    await this.offerProductRepo.bulkCreate(records);
  }
}