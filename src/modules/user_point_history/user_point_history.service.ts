import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { UserPointsHistory } from './entites/user_point_history.entity';
import { PointActionType } from 'src/common/enums/points_action_type';
import { PointActionSoucre } from 'src/common/enums/point_action_source';
import { Order } from '../order/entities/order.entity';
import { Store } from '../store/entities/store.entity';
import { StoreLanguage } from '../store/entities/store_language.entity';
import { Language } from 'src/common/enums/language';

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

    async getUserPoints(customerId: number, page = 1, limit = 10,lang:Language) 
    {
        const offset = (page - 1) * limit;

        const { rows, count } = await this.userPointsHistoryRepo.findAndCountAll({
        where: { customerId },
        include: [
            {
                model: Order,
                include:[{model:Store,include:[{model:StoreLanguage,where:{languageCode:lang},required: false}]}]
            },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        });

        const totalPages = Math.ceil(count / limit);

        return {
            totalPages,
            totalItems: count,
            data: rows,
        };
    }
}
