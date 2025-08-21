import { repositories } from 'src/common/enums/repositories';
import { SubType } from '../entities/subtype.entity';
import { SubTypeLanguage } from '../entities/sybtype_language.entity';
export const SubTypeProvider = [
  {
    provide: repositories.sub_type_repository,
    useValue: SubType,
  },
  {
    provide: repositories.sub_type_language_repository,
    useValue: SubTypeLanguage,
  },
];
