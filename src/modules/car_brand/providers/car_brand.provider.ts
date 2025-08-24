import { repositories } from 'src/common/enums/repositories';
import { CarBrand } from '../entities/car_brand.entity';
import { CarBrandLanguage } from '../entities/car_brand.languae.entity';
export const CarBrandProvider = [
  {
    provide: repositories.car_brand_repository,
    useValue: CarBrand,
  },
  {
    provide: repositories.car_brand_langauge_repository,
    useValue: CarBrandLanguage,
  },
];
