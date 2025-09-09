import { StoreCommissionService } from './../store_commission/store_commission.service';
import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { StoreTransaction } from './entities/store_transaction.entity';
import { CreateStoreTransactionDto } from './dto/create-transaction.dto';

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
}