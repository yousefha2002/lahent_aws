import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { SectorService } from './sector.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateSectorDto } from './dto/create-sector.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { SectorDto } from './dto/sector.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('sector')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}
  @PermissionGuard([RoleStatus.ADMIN])
  @Post('create')
  @ApiOperation({ summary: 'Create a new sector' })
  @ApiBody({ type: CreateSectorDto })
  @ApiResponse({
    status: 201,
    description: 'Sector created successfully',
    schema: { example: { message: 'Created successfully' } },
  })
  createSector(
    @Body() body: CreateSectorDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.sectorService.create(body, lang);
  }

  @Serilaize(SectorDto)
  @Get()
  @ApiOperation({ summary: 'Get All sectos' })
  @ApiResponse({status: 200,type:[SectorDto]})
  getAllSectors(@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.sectorService.getAll(lang);
  }

  @PermissionGuard([RoleStatus.ADMIN])
  @Put(':id')
  @ApiOperation({ summary: 'Update a sector' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateSectorDto })
  @ApiResponse({
    status: 200,
    description: 'Sector updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  updateSector(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSectorDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.sectorService.update(id, body, lang);
  }

  @Get('admin')
  @PermissionGuard([RoleStatus.ADMIN])
  @Serilaize(SectorDto)
  @ApiOperation({ summary: 'Get all sectors (admin, without language filter)' })
  @ApiResponse({ status: 200, type: [SectorDto] })
  getAllSectorsAdmin() {
    return this.sectorService.getAll();
  }
}
