import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { OrderGateway } from './gateways/order.gateway';

@Module({
  controllers: [],
  providers: [RealtimeService,OrderGateway],
  exports:[RealtimeService]
})
export class RealtimeModule {}
