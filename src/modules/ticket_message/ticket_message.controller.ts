import { Controller } from '@nestjs/common';
import { TicketMessageService } from './ticket_message.service';

@Controller('ticket-message')
export class TicketMessageController {
  constructor(private readonly ticketMessageService: TicketMessageService) {}
}
