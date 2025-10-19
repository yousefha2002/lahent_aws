import { TicketMessage } from '../entities/ticket_message.entity';
import { repositories } from 'src/common/enums/repositories';
export const TicketMessageProvider = [
    {
        provide: repositories.ticket_message_repository,
        useValue: TicketMessage,
    },
];
