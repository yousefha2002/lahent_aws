import { AdminService } from 'src/modules/admin/admin.service';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/requests/create-ticket.dto';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { AssignTicketDto } from './dto/requests/assign-ticket.dto';
import { TicketStatus } from 'src/common/enums/ticket_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Injectable()
export class TicketService {
    constructor(
        @Inject(repositories.ticket_repository) private ticketRepo: typeof Ticket,
        private readonly i18n: I18nService,
        private readonly adminService:AdminService
    ){}

    async createStoreTicket(storeId: number, dto: CreateTicketDto,lang:Language) {
        await this.ticketRepo.create({
            type: 'store',
            storeCreatorId: storeId,  
            storeId,
            subject: dto.subject,
            description: dto.description,
            status: TicketStatus.PENDING,
        })
        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return { message };
    }

    async assignTicket(dto:AssignTicketDto,lang:Language) {
        const {assignedAdminId,ticketId} = dto
        const ticket = await this.ticketRepo.findOne({where:{id:ticketId,status: [TicketStatus.PENDING, TicketStatus.IN_PROGRESS]}});
        if (!ticket) throw new NotFoundException('Ticket not found');
        await this.adminService.checkAdminPermission(assignedAdminId,PermissionKey.ReviewTicket)   
        if (!ticket) throw new NotFoundException('Ticket not found');
        ticket.assignedAdminId = assignedAdminId;
        ticket.status = TicketStatus.IN_PROGRESS
        await ticket.save();
        const message = this.i18n.translate('translation.updatedSuccefully', { lang });
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

    async getTicketsForReviewer(assignedAdminId: number,page: number,limit: number,status?: TicketStatus) {
    const where: any = { assignedAdminId };
    if (status) where.status = status;
    const { rows, count } = await this.ticketRepo.findAndCountAll({
        where,
        offset: (page - 1) * limit,
        limit,
        order: [['createdAt', 'DESC']],
        include: [
        { association: 'store' },
        { association: 'assignedAdmin' },
        ],
    });
    return {
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
    };
    }
}
