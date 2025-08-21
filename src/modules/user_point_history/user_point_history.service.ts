import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { UserPointsHistory } from './entites/user_point_history.entity';
import { PointActionType } from 'src/common/enums/points_action_type';
import { PointActionSoucre } from 'src/common/enums/point_action_source';

@Injectable()
export class UserPointHistoryService {
    constructor(
        @Inject(repositories.user_points_history_repository) private userPointsHistoryRepo: typeof UserPointsHistory,
    ){}

    async create(params: {
        customerId: number;
        type: PointActionType;
        source: PointActionSoucre;
        points: number;
        relatedOrderId?: number;
    },transaction?:any) {
        const { customerId, type, source, points, relatedOrderId } = params;
        return await this.userPointsHistoryRepo.create({
            customerId,
            type,
            source,
            points,
            relatedOrderId: relatedOrderId ?? null,
        },{transaction});
    }
}
