import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/requests/create-ticket.dto';
import { RoleStatus } from 'src/common/enums/role_status';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { PermissionKey } from 'src/common/enums/permission-key';
import { AssignTicketDto } from './dto/requests/assign-ticket.dto';
import { TicketStatus } from 'src/common/enums/ticket_status';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { StoreListPagination } from './dto/responses/store-ticket-list.dto';
import { ReviewerTicketPaginationDto } from './dto/responses/reviewer-ticket-list.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @PermissionGuard([RoleStatus.STORE], ApprovedStoreGuard)
  @ApiOperation({ summary: 'Create a new ticket for the current store' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({status: 201,
    description: 'Ticket created successfully',
    schema: { example: { message: 'Created successfully' } }
  })
  @Post('store')
  createStoreTicket(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateTicketDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const { context } = user;
    return this.ticketService.createStoreTicket(context.id, dto,lang);
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ManageTicket)
  @ApiOperation({ summary: 'Assign ticket to an existing admin as reviewer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AssignTicketDto })
  @ApiResponse({ status: 200, schema: { example: { message: 'Created successfully' } } })
  @Patch('assign-reviewer')
  async assignTicket(
    @Body() dto: AssignTicketDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.ticketService.assignTicket( dto,lang);
  }

  @Serilaize(StoreListPagination)
  @PermissionGuard([RoleStatus.STORE])
  @ApiOperation({ summary: 'Get all tickets for the current store with pagination' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'status', required: false, enum:TicketStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200,type:StoreListPagination })
  @Get()
  async getStoreTickets(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: TicketStatus,
  ) {
    const { context } = user;
    return this.ticketService.getStoreTickets(context.id, page,limit,status);
  }

  @Serilaize(ReviewerTicketPaginationDto)
  @PermissionGuard([RoleStatus.ADMIN], PermissionKey.ReviewTicket)
  @ApiOperation({ summary: 'Get all tickets assigned to the current reviewer with pagination' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: ReviewerTicketPaginationDto })
  @Get('reviewer-tickets')
  async getReviewerTickets(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: TicketStatus,
  ) {
    const { actor } = user;
    return this.ticketService.getTicketsForReviewer(actor.id, page, limit, status);
  }
}
