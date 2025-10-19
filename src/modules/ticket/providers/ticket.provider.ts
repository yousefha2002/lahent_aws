import { Ticket } from './../entities/ticket.entity';
import { repositories } from 'src/common/enums/repositories';
export const TicketProvider = [
    {
        provide: repositories.ticket_repository,
        useValue: Ticket,
    },
];
