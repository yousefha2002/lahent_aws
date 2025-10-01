import { UserPointHistoryService } from '../../user_point_history/user_point_history.service';
import { CustomerService } from '../../customer/customer.service';
import { Injectable } from '@nestjs/common';
import { PointActionType } from 'src/common/enums/points_action_type';
import { PointActionSoucre } from 'src/common/enums/point_action_source';

@Injectable()
export class OrderPointsService {
    constructor(
        private readonly customerService: CustomerService,
        private readonly userPointHistoryService: UserPointHistoryService,
    ){}

    async addPointsForRefund(customerId: number, points: number, orderId: number, transaction: any) 
    {
        if(points > 0){
            await this.customerService.addPoints(customerId, points, transaction);
            await this.userPointHistoryService.create({
                customerId,
                type: PointActionType.REFUND,
                source: PointActionSoucre.ORDER,
                points,
                relatedOrderId: orderId,
            }, transaction);
        }
    }

    async deductPointsForOrder(
        customerId: number,
        points: number,
        orderId: number,
        transaction: any,
    ) {
        if (points > 0) {
            await this.customerService.detuctPoints(customerId, points, transaction);
            await this.userPointHistoryService.create({
                customerId,
                type: PointActionType.REDEEMED,
                source: PointActionSoucre.ORDER,
                points: points,
                relatedOrderId: orderId,
            }, transaction);
        }
    }
}