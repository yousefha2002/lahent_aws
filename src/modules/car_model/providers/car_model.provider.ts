import { repositories } from 'src/common/enums/repositories';
import { CarModel } from '../entites/car_model.entity';
import { CarModelLanguage } from '../entites/car_mode_language.entity';
export const CarModelProvider = [
  {
    provide: repositories.car_model_repository,
    useValue: CarModel,
  },
  {
    provide: repositories.car_model_langauge_repository,
    useValue: CarModelLanguage,
  },
];
