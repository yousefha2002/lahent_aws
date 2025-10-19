import { forwardRef, Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketProvider } from './providers/ticket.provider';
import { UserContextModule } from '../user-context/user-context.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService,...TicketProvider],
  imports:[forwardRef(()=>UserContextModule),AdminModule]
})
export class TicketModule {}
