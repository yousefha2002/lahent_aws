import { Module } from '@nestjs/common';
import { TicketMessageService } from './ticket_message.service';
import { TicketMessageController } from './ticket_message.controller';
import { TicketMessageProvider } from './providers/ticket_message.provider';

@Module({
  controllers: [TicketMessageController],
  providers: [TicketMessageService,...TicketMessageProvider],
})
export class TicketMessageModule {}
