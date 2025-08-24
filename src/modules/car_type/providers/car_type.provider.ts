import { repositories } from 'src/common/enums/repositories';
import { CarType } from '../entites/car_type.entity';
import { CarTypeLanguage } from '../entites/car_type_language.entity';
export const CarTypeProvider = [
  {
    provide: repositories.car_type_repository,
    useValue: CarType,
  },
  {
    provide: repositories.car_type_langauge_repository,
    useValue: CarTypeLanguage,
  },
];
