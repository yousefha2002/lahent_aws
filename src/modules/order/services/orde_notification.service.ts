import { Injectable } from '@nestjs/common';
import { RealtimeService } from 'src/modules/realtime/realtime.service';


@Injectable()
export class OrderNotificationService {
    constructor(private readonly rt: RealtimeService) {}

    notifyCustomer(data: OrderNotificationInput) {
        if (!data.customerId) {
            throw new Error('customerId is required for notifyCustomer');
        }
        const payload = {orderId: data.orderId,status: data.status};
        this.rt.emitOrderUpdateToRoom(this.rt.customerRoom(data.customerId), payload);
    }

    notifyStore(data: OrderNotificationInput) {
        if (!data.storeId) {
            throw new Error('storeId is required for notifyStore');
        }

        const payload = {orderId: data.orderId,status: data.status,};
        this.rt.emitOrderUpdateToRoom(this.rt.storeRoom(data.storeId), payload);
    }

    notifyBoth(data: OrderNotificationInput) {
        if (!data.customerId || !data.storeId) {
            throw new Error('Both customerId and storeId are required for notifyBoth');
        }
        this.notifyCustomer(data);
        this.notifyStore(data);
    }
}
