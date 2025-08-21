import { repositories } from 'src/common/enums/repositories';
import { CarBrand } from '../entities/car_brand.entity';
export const CarBrandProvider = [
    {
        provide: repositories.car_brand_repository,
        useValue: CarBrand,
    },
];
