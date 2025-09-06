import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { OrderUpdatePayload } from './realtime.payload';
import { RealtimeEvents } from './realtime.events';

@Injectable()
export class RealtimeService {
    private readonly logger = new Logger(RealtimeService.name);
    private _server: Server | null = null;

    // يتم استدعاؤه من الـ Gateway بعد التهيئة
    bindServer(server: Server) {
        this._server = server;
    }

    // Helpers لأسماء الغرف
    storeRoom = (storeId: number) => `store-${storeId}`;
    customerRoom = (customerId: number) => `customer-${customerId}`;

    // إرسال تحديث طلب لغرفة معينة
    emitOrderUpdateToRoom(room: string, payload: OrderUpdatePayload) {
        if (!this._server) return this.logger.warn('Socket server not bound yet');
        this._server.to(room).emit(RealtimeEvents.OrderUpdated, payload);
    }

    // إرسال حدث "تم إنشاء الطلب" (اختياري)
    emitOrderPlacedToRoom(room: string, payload: OrderUpdatePayload) {
        if (!this._server) return this.logger.warn('Socket server not bound yet');
        this._server.to(room).emit(RealtimeEvents.OrderPlaced, payload);
    }
}