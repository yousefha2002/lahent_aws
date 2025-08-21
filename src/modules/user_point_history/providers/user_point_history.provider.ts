import { repositories } from 'src/common/enums/repositories';
import { UserPointsHistory } from '../entites/user_point_history.entity';
export const UserPointsHistoryProvider = [
    {
        provide: repositories.user_points_history_repository,
        useValue: UserPointsHistory,
    },
];