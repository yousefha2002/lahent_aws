import { repositories } from 'src/common/enums/repositories';
import { CarModel } from '../entites/car_model.entity';
export const CarModelProvider = [
    {
        provide: repositories.car_model_repository,
        useValue: CarModel,
    },
];
