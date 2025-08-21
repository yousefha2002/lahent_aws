import { repositories } from 'src/common/enums/repositories';
import { Gift } from '../entities/gift.entity';
export const GiftProvider = [
  {
    provide: repositories.gift_repository,
    useValue: Gift,
  },
];
