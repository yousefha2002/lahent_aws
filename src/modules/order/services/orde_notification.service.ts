import { FcmTokenService } from './../../fcm_token/fcm_token.service';
import { OrderStatus } from './../../../common/enums/order_status';
import { Injectable } from '@nestjs/common';
import { Language } from 'src/common/enums/language';
import { RoleStatus } from 'src/common/enums/role_status';
import { OrderNotifications } from 'src/common/notification/order-notifications';
import { RealtimeService } from 'src/modules/realtime/realtime.service';


@Injectable()
export class OrderNotificationService {
    constructor(
        private readonly rt: RealtimeService,
        private readonly fcmTokenService:FcmTokenService
    ) {}

    // real time socket
    notifyCustomer(data: OrderSocketInput) {
        if (!data.customerId) {
            throw new Error('customerId is required for notifyCustomer');
        }
        const payload = {orderId: data.orderId,status: data.status};
        this.rt.emitOrderUpdateToRoom(this.rt.customerRoom(data.customerId), payload);
    }

    notifyStore(data: OrderSocketInput) {
        if (!data.storeId) {
            throw new Error('storeId is required for notifyStore');
        }

        const payload = {orderId: data.orderId,status: data.status,};
        this.rt.emitOrderUpdateToRoom(this.rt.storeRoom(data.storeId), payload);
    }

    notifyBoth(data: OrderSocketInput) {
        if (!data.customerId || !data.storeId) {
            throw new Error('Both customerId and storeId are required for notifyBoth');
        }
        this.notifyCustomer(data);
        this.notifyStore(data);
    }

    // fcm 
    async sendOrderNotificationToStore(orderId:number,status:OrderStatus,storeId:number,customerName:string, lang: Language) {
        return this.fcmTokenService.notifyUser(
            storeId,
            RoleStatus.STORE,
            OrderNotifications.NEW_ORDER.title[lang],
            OrderNotifications.NEW_ORDER.body[lang](customerName),
            { orderId: orderId.toString(), status: status }
        );
    }
}
