import { repositories } from 'src/common/enums/repositories';
import { OfferProduct } from '../entites/offer_product.entity';
export const OfferProductProvider = [
  {
    provide: repositories.offer_product_repository,
    useValue: OfferProduct,
  },
];
