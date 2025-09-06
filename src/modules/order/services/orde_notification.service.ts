import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { RealtimeService } from 'src/modules/realtime/realtime.service';

@Injectable()
export class OrderNotificationService {
    constructor(private readonly rt: RealtimeService) {}

    notifyCustomer(order: Order) {
        this.rt.emitOrderUpdateToRoom(
        this.rt.customerRoom(order.customerId),
        { orderId: order.id, status: order.status }
        );
    }

    notifyStore(order: Order) {
        this.rt.emitOrderUpdateToRoom(
        this.rt.storeRoom(order.storeId),
        { orderId: order.id, status: order.status }
        );
    }

    notifyBoth(order: Order) {
        this.notifyCustomer(order);
        this.notifyStore(order);
    }
    }