import { repositories } from 'src/common/enums/repositories';
import { Product } from '../entities/product.entity';
export const ProductProvider = [
    {
        provide: repositories.product_repository,
        useValue: Product,
    },
];