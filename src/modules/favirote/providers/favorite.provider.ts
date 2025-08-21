import { repositories } from 'src/common/enums/repositories';
import { Favorite } from '../entities/favirote.entity';
export const FavoriteProvider = [
  {
    provide: repositories.favirote_repository,
    useValue: Favorite,
  },
];
