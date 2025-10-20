import { PartialType } from '@nestjs/swagger';
import { CreateTicketTypeDto } from './create_ticket_type.dto';

export class UpdateTicketTypeDto extends PartialType(CreateTicketTypeDto) {}