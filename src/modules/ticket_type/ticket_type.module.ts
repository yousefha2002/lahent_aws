import { forwardRef, Module } from '@nestjs/common';
import { TicketTypeService } from './ticket_type.service';
import { TicketTypeController } from './ticket_type.controller';
import { UserContextModule } from '../user-context/user-context.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { DatabaseModule } from 'src/database/database.module';
import { TicketTypeProvider } from './providers/ticket_type.provider';

@Module({
  controllers: [TicketTypeController],
  providers: [TicketTypeService,...TicketTypeProvider],
  imports:[forwardRef(()=>UserContextModule),AuditLogModule,DatabaseModule]
})
export class TicketTypeModule {}
