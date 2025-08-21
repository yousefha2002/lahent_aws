import { repositories } from 'src/common/enums/repositories';
import { TypeLanguage } from '../entities/type_language.entity';
export const TypeLanguageProvider = [
    {
        provide: repositories.typeLanguage_repository,
        useValue: TypeLanguage,
    },
];