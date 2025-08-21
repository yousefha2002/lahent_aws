import { repositories } from 'src/common/enums/repositories';
import { Car } from '../entities/car.entity';
export const CarProvider = [
    {
        provide: repositories.car_repository,
        useValue: Car,
    },
];
