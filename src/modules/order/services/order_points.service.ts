import { UserPointHistoryService } from '../../user_point_history/user_point_history.service';
import { TransactionService } from '../../transaction/transaction.service';
import { CustomerService } from '../../customer/customer.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order_status';
import { TransactionType } from 'src/common/enums/transaction_type';
import { PointActionType } from 'src/common/enums/points_action_type';
import { PointActionSoucre } from 'src/common/enums/point_action_source';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class OrderPointsService {
    constructor(
        private readonly customerService: CustomerService,
        private readonly transactionService: TransactionService,
        private readonly userPointHistoryService: UserPointHistoryService,
        private readonly i18n: I18nService,
    ){}

    async handlePointsAfterPayment(
        customerId: number,
        pointsRedeemed: number,
        orderId: number,
        transaction: any,
    ) {
        if (pointsRedeemed > 0) {
            await this.customerService.detuctPoints(customerId, pointsRedeemed, transaction);
            await this.userPointHistoryService.create({
                customerId,
                type: PointActionType.REDEEMED,
                source: PointActionSoucre.ORDER,
                points: pointsRedeemed,
                relatedOrderId: orderId,
            }, transaction);
        }
    }

    async validateAndRedeemPoints(order: Order, transaction: any, lang = Language.en) 
    {
        const customer = await this.customerService.findById(order.customerId);

        if (order.pointsRedeemed > 0) {
            // تحقق من وجود نقاط كافية
            if (customer.points < order.pointsRedeemed) {
                const orderAmountToRefund = (order.walletAmountUsed || 0) + (order.gatewayAmountUsed || 0);
                if (orderAmountToRefund > 0) {
                    await this.customerService.addToWallet(order.customerId, orderAmountToRefund, transaction);
                    await this.transactionService.createTransaction({
                        customerId: order.customerId,
                        amount: orderAmountToRefund,
                        direction: 'IN',
                        type: TransactionType.REFUND_WALLET,
                        orderId: order.id,
                    }, transaction);
                }
                throw new BadRequestException(
                    await this.i18n.translate('translation.orders.points_insufficient', { lang })
                );
            }

            // تحقق من انتهاء صلاحية الطلب
            if (order.status === OrderStatus.EXPIRED_PAYMENT) {
                const orderAmountToRefund = (order.walletAmountUsed || 0) + (order.gatewayAmountUsed || 0);
                if (orderAmountToRefund > 0) {
                    await this.customerService.addToWallet(order.customerId, orderAmountToRefund, transaction);
                    await this.transactionService.createTransaction({
                        customerId: order.customerId,
                        amount: orderAmountToRefund,
                        direction: 'IN',
                        type: TransactionType.REFUND_WALLET,
                        orderId: order.id,
                    }, transaction);
                }
                throw new BadRequestException(
                    await this.i18n.translate('translation.orders.expired_order_refund', { lang })
                );
            }

            // خصم النقاط وتسجيلها
            await this.customerService.detuctPoints(order.customerId, order.pointsRedeemed, transaction);
            await this.userPointHistoryService.create({
                customerId: order.customerId,
                type: PointActionType.REDEEMED,
                source: PointActionSoucre.ORDER,
                points: order.pointsRedeemed,
                relatedOrderId: order.id,
            }, transaction);
        }
    }
}