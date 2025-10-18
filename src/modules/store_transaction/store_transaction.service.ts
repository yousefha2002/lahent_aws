import { StoreService } from 'src/modules/store/services/store.service';
import { StoreCommissionService } from './../store_commission/store_commission.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { StoreTransaction } from './entities/store_transaction.entity';
import { CreateAdminStoreTransactionDto, CreateStoreTransactionDto } from './dto/create-transaction.dto';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Avatar } from '../avatar/entities/avatar.entity';
import { literal } from 'sequelize';
import { round2 } from 'src/common/utils/round2';
import { getDateRange } from 'src/common/utils/getDateRange';
import { Op } from 'sequelize';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { S3Service } from '../s3/s3.service';
import { getEffectiveDateRange } from 'src/common/utils/getDataRangeOptions';

@Injectable()
export class StoreTransactionService {
    constructor(
        @Inject(repositories.store_transaction_repository) private storeTransactionRepo: typeof StoreTransaction,
        private readonly storeCommissionService:StoreCommissionService,
        private readonly i18n: I18nService,
        private s3Service: S3Service,
        private readonly storeService:StoreService
    ) {}

    async create(dto: CreateStoreTransactionDto,transaction?: any) {
        const { storeId, orderId, totalAmount,status } = dto;

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
            status
        },{transaction});
    }

    async getAllByStore(storeId: number, page = 1, limit = 10,status?: StoreTransactionType) {
        const offset = (page - 1) * limit;
        const where: any = { storeId };
        if (status) {
            where.status = status;
        }

        const { rows, count } = await this.storeTransactionRepo.findAndCountAll({
            where,
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
                WHEN status = 'ADMIN_WITHDRAW' THEN storeRevenue
                ELSE 0
                END
            )
            `), 'availableBalance']
        ],
        where: { storeId }
        });

        const availableBalance = round2(Number(result?.get('availableBalance')) || 0)
        return availableBalance
    }

    async getStoreFinancials(storeId: number, filter: string, specificDate?: string,from?:string,to?:string) 
    {
        const { start, end } = getEffectiveDateRange({ filter, specificDate, from, to });
        const result = await this.storeTransactionRepo.findOne({
            attributes: [
                [literal(`
                    SUM(
                        CASE
                            WHEN status = 'COMPLETED' THEN storeRevenue
                            WHEN status = 'SETTLEMENT' THEN -storeRevenue
                            WHEN status = 'ADMIN_WITHDRAW' THEN storeRevenue
                            ELSE 0
                        END
                    )
                `), 'availableBalance'],

                [literal(`
                    SUM(
                        CASE
                            WHEN status = 'CANCELED' THEN totalAmount
                            ELSE 0
                        END
                    )
                `), 'totalCanceled'],

                [literal(`
                    SUM(
                        CASE
                            WHEN status = 'REFUNDED' THEN totalAmount
                            ELSE 0
                        END
                    )
                `), 'totalRefunded'],
                [literal(`
                SUM(
                    CASE
                        WHEN status = 'COMPLETED' THEN storeRevenue
                        ELSE 0
                    END
                )
                `), 'totalEarning'],
            ],
            where: {
                storeId,
                createdAt: { [Op.between]: [start, end] }
            }
        });

        return {
            availableBalance: round2(Number(result?.get('availableBalance')) || 0),
            totalCanceled: round2(Number(result?.get('totalCanceled')) || 0),
            totalRefunded: round2(Number(result?.get('totalRefunded')) || 0),
            totalEarning: round2(Number(result?.get('totalEarning')) || 0),
        };
    }

    async createAdminTransaction(lang:Language,dto:CreateAdminStoreTransactionDto,file?:Express.Multer.File,transaction?: any) {
        const {status,storeId,totalAmount,note} = dto
        if (status !== StoreTransactionType.SETTLEMENT && status !== StoreTransactionType.ADMIN_WITHDRAW) {
                throw new BadRequestException('Invalid transaction type. Must be SETTLEMENT or ADMIN_WITHDRAW');
        }

        const amountNumber = parseFloat(totalAmount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
            throw new BadRequestException('totalAmount must be a number greater than 0');
        }
        await this.storeService.getStoreById(storeId)
        let receiptUrl: string | null = null;
        if (file) {
            const uploaded = await this.s3Service.uploadImage(file);
            receiptUrl = uploaded.secure_url;
        }
        await this.storeTransactionRepo.create({storeId,storeRevenue:totalAmount,status,note,receipt:receiptUrl}, { transaction });
        return {message: this.i18n.translate('translation.createdSuccefully', { lang }),}
    }
}