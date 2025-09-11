import { StoreCommissionService } from './../store_commission/store_commission.service';
import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { StoreTransaction } from './entities/store_transaction.entity';
import { CreateStoreTransactionDto } from './dto/create-transaction.dto';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Avatar } from '../avatar/entities/avatar.entity';
import { literal } from 'sequelize';

@Injectable()
export class StoreTransactionService {
    constructor(
        @Inject(repositories.store_transaction_repository) private storeTransactionRepo: typeof StoreTransaction,
        private readonly storeCommissionService:StoreCommissionService
    ) {}

    async create(dto: CreateStoreTransactionDto,transaction?: any) {
        const { storeId, orderId, totalAmount } = dto;

        const commissionPercent = await this.storeCommissionService.getCommission(storeId);
        const commissionAmount = (totalAmount * commissionPercent) / 100;
        const storeRevenue = totalAmount - commissionAmount;

        return await this.storeTransactionRepo.create({
            storeId,
            orderId,
            totalAmount,
            commissionPercent,
            commissionAmount,
            storeRevenue,
        },{transaction});
    }

    async getAllByStore(storeId: number, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const { rows, count } = await this.storeTransactionRepo.findAndCountAll({
            where: { storeId },
            offset,
            limit,
            order: [['createdAt', 'DESC']],
            include:[{
                model:Order,
                include:[{model:Customer,include:[Avatar]}]
            }]
        });

        return {
            data: rows,
            total: count,
            totalPages:Math.ceil(count / limit)
        };
    }

    async findAvailableBalance(storeId:number)
    {
        const result = await StoreTransaction.findOne({
        attributes: [
            [literal(`
            SUM(
                CASE
                WHEN status = 'COMPLETED' THEN storeRevenue
                WHEN status = 'SETTLEMENT' THEN -storeRevenue
                ELSE 0
                END
            )
            `), 'availableBalance']
        ],
        where: { storeId }
        });

        let availableBalance = Number(result?.get('availableBalance')) || 0;
        availableBalance = Math.round(availableBalance * 100) / 100;
        return availableBalance
    }
}