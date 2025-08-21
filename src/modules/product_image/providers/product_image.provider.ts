import { repositories } from 'src/common/enums/repositories';
import { ProductImage } from '../entities/product_image.entity';
export const ProductImageProvider = [
    {
        provide: repositories.productImage_repository,
        useValue: ProductImage,
    },
];