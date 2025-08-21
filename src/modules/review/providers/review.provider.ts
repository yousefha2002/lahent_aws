import { repositories } from 'src/common/enums/repositories';
import { Review } from '../entities/review.entity';
export const ReviewProvider = [
  {
    provide: repositories.review_repository,
    useValue: Review,
  },
];
