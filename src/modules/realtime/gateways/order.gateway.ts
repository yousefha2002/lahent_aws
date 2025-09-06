import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from '../realtime.service';
import { RealtimeEvents } from '../realtime.events';

@WebSocketGateway({
    cors: { origin: '*', credentials: true },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly rt: RealtimeService) {}

    afterInit() {
        // ربط السيرفر داخل الـ service لكي يقدر يرسل أحداث من أي Service
        this.rt.bindServer(this.server);
    }

    handleConnection(client: Socket) {
        // تقدر هنا تعمل verify لـ JWT من client.handshake.auth لو حابب
        // مثال: const token = client.handshake.auth?.token
        // ثم التحقق وإلا افصل الاتصال
        // client.disconnect(true);
    }

    handleDisconnect(client: Socket) {
        // ممكن تسجل خروج العميل من الغرف إن أردت
    }

    @SubscribeMessage(RealtimeEvents.JoinRoom)
    handleJoinRoom(client: Socket, room: string) {
        client.join(room);
    }

    @SubscribeMessage(RealtimeEvents.LeaveRoom)
    handleLeaveRoom(client: Socket, room: string) {
        client.leave(room);
    }
}