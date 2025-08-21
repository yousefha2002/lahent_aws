import { repositories } from 'src/common/enums/repositories';
import { OpeningHour } from '../entites/opening_hour.entity';
export const OpeningHourProvider = [
    {
        provide: repositories.openingHour_repository,
        useValue: OpeningHour,
    },
];