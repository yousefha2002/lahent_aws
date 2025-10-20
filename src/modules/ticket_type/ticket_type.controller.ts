import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TicketTypeService } from './ticket_type.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';
import { CreateTicketTypeDto } from './dto/create_ticket_type.dto';
import { getLang } from 'src/common/utils/get-lang.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UpdateTicketTypeDto } from './dto/update_ticket_type.dto';
import { TicketTypeDto } from './dto/ticket_type.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';

@Controller('ticket-type')
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

    @ApiSecurity('access-token')
    @PermissionGuard([RoleStatus.ADMIN], PermissionKey.CreateTicketType)
    @Post('create')
    @ApiOperation({ summary: 'Create a new ticket type' })
    @ApiBody({ type: CreateTicketTypeDto })
    @ApiResponse({ status: 201, schema: { example: { message: 'Created successfully' } } })
    create(@Body() dto: CreateTicketTypeDto, @I18n() i18n: I18nContext) {
      const lang = getLang(i18n);
      return this.ticketTypeService.create(dto, lang);
    }

    @ApiSecurity('access-token')
    @PermissionGuard([RoleStatus.ADMIN], PermissionKey.UpdateTicketType)
    @Put(':id')
    @ApiOperation({ summary: 'Update a ticket type' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateTicketTypeDto })
    @ApiResponse({ status: 200, schema: { example: { message: 'Updated successfully' } } })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketTypeDto, @I18n() i18n: I18nContext) {
      const lang = getLang(i18n);
      return this.ticketTypeService.update(id, dto, lang);
    }

    @Serilaize(TicketTypeDto)
    @Get()
    @ApiOperation({ summary: 'Get all ticket types' })
    @ApiResponse({ status: 200, type: [TicketTypeDto] })
    getAll(@I18n() i18n: I18nContext) {
      const lang = getLang(i18n);
      return this.ticketTypeService.getAll(lang);
    }

    @Serilaize(TicketTypeDto)
    @Get('admin')
    @ApiSecurity('access-token')
    @PermissionGuard([RoleStatus.ADMIN], PermissionKey.ViewTicketType)
    @ApiOperation({ summary: 'Get all ticket types (admin, without language filter)' })
    @ApiResponse({ status: 200, type: [TicketTypeDto] })
    getAllAdmin() {
      return this.ticketTypeService.getAll();
    }
}
