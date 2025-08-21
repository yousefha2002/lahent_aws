import { repositories } from 'src/common/enums/repositories';
import { CarType } from '../entites/car_type.entity';
export const CarTypeProvider = [
    {
        provide: repositories.car_type_repository,
        useValue: CarType,
    },
];
