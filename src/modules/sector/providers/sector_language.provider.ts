import { repositories } from 'src/common/enums/repositories';
import { SectorLanguage } from '../entities/sectore_langauge.entity';
export const SectorLanguageProvider = [
    {
        provide: repositories.sector_language_repository,
        useValue: SectorLanguage,
    },
];