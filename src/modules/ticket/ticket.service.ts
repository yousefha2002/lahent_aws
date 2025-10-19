import { AdminService } from 'src/modules/admin/admin.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { TicketStatus } from 'src/common/enums/ticket_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Injectable()
export class TicketService {
    constructor(
        @Inject(repositories.ticket_repository) private ticketRepo: typeof Ticket,
        private readonly i18n: I18nService,
        private readonly adminService:AdminService
    ){}

    async createTicket(storeId: number, dto: CreateTicketDto,lang:Language) {
        await this.ticketRepo.create({
            storeId,
            subject: dto.subject,
            description: dto.description,
        });
        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return { message };
    }

    async assignTicketToReviewer(actor: ActorInfo,dto:AssignTicketDto,lang:Language) {
        const {reviewerAdminId,ticketId} = dto
        const ticket = await this.ticketRepo.findOne({where:{id:ticketId,status:TicketStatus.PENDING}});
        if (!ticket) throw new NotFoundException('Ticket not found');
        await this.adminService.checkAdminPermission(reviewerAdminId,PermissionKey.ReviewTicket)    
        ticket.reviewerId = reviewerAdminId;
        ticket.assignedAdminId = actor.id
        await ticket.save();
        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return { message };
    }

    async getStoreTickets(storeId: number, page:number,limit:number,status?:TicketStatus) {
        const where: any = { storeId };
        if (status) where.status = status;

        const { rows, count } = await this.ticketRepo.findAndCountAll({
            where,
            offset: (page - 1) * limit,
            limit,
            order: [['createdAt', 'DESC']],
        });

        return {
            data: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
        };
    }
}
