import { repositories } from 'src/common/enums/repositories';
import { Sector } from '../entities/sector.entity';
export const SectorProvider = [
    {
        provide: repositories.sector_repository,
        useValue: Sector,
    },
];