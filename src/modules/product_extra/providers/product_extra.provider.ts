import { repositories } from 'src/common/enums/repositories';
import { ProductExtra } from '../entities/product_extra.entity';
export const ProductExtraProvider = [
    {
        provide: repositories.productExtra_repository,
        useValue: ProductExtra,
    },
];