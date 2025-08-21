import { repositories } from 'src/common/enums/repositories';
import { TypeLanguage } from '../entities/type_language.entity';
import { Type } from '../entities/type.entity';
export const TypeProvider = [
  {
    provide: repositories.type_repository,
    useValue: Type,
  },
  {
    provide: repositories.typeLanguage_repository,
    useValue: TypeLanguage,
  },
];
