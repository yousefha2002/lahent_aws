import { TicketType } from '../entities/ticket_type.entity';
import { repositories } from 'src/common/enums/repositories';
import { TicketTypeLanguage } from '../entities/ticket_type_language.entity';
export const TicketTypeProvider = [
    {
        provide: repositories.ticket_type_repository,
        useValue: TicketType,
    },
    {
        provide: repositories.ticket_type_language_repository,
        useValue: TicketTypeLanguage,
    }
]