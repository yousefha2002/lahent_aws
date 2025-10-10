import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PageService } from './page.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { CreatePageDto } from './dto/create-page.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PageDto } from './dto/page.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PageType } from 'src/common/enums/page_type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @PermissionGuard([RoleStatus.ADMIN])
  @ApiOperation({ summary: 'Create or update a page' })
  @ApiBody({ type: CreatePageDto })
  @ApiResponse({
    status: 201,
    description: 'Page created or updated successfully',
    schema: { example: { success: true } },
  })
  @Post()
  createOrUpdate(
    @Body() dto: CreatePageDto,
  ) {
    return this.pageService.createOrUpdatePage(dto);
  }

  @Serilaize(PageDto)
  @ApiOperation({ summary: 'Get a page by type' })
  @ApiParam({name: 'type',description: 'Type of the page to retrieve',enum: PageType,example: 'PP',})
  @ApiResponse({status: 200,description: 'Page retrieved successfully',type: PageDto,})
  @Get(':type')
  getOne(@Param('type') type: PageType,@I18n() i18n: I18nContext,) {
    const lang = getLang(i18n);
    return this.pageService.getPageByType(type,lang);
  }
}
