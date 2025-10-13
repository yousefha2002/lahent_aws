import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { RoleWithCountsDto } from './dto/role-with-count.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

    @ApiOperation({ summary: 'Create a new role (admin only)' })
    @ApiSecurity('access-token')
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({status: 201,schema: { example: { message: 'Created successfully' } }})
    @PermissionGuard([RoleStatus.ADMIN])
    @Post()
    async createRole(
      @I18n() i18n: I18nContext,
      @Body() dto: CreateRoleDto,
    ) {
      const lang = getLang(i18n);
      return this.roleService.createRoleWithPermissions(dto, lang);
    }

    @ApiSecurity('access-token')
    @ApiOperation({ summary: 'Get all roles with admin and permission counts' })
    @ApiResponse({status: 200,type: [RoleWithCountsDto]})
    @PermissionGuard([RoleStatus.ADMIN])
    @ApiQuery({
      name: 'withCounts',
      required: false,
      type: String,
      enum: ['true', 'false'],
      description: 'Include admin and permission counts if true',
    })
    @Get()
    async getAllRolesWithCounts(@Query('withCounts') withCounts?: string){
        const includeCounts = withCounts === 'true';
        return this.roleService.findAllRoles(includeCounts);
    }

    @ApiOperation({ summary: 'Update a role with permissions (admin only)' })
    @ApiSecurity('access-token')
    @ApiParam({ name: 'roleId', type: Number })
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({ status: 200, schema: { example: { message: 'Updated successfully' } } })
    @PermissionGuard([RoleStatus.ADMIN])
    @Put(':roleId')
    async updateRole(
      @Param('roleId') roleId: number,
      @Body() dto: CreateRoleDto,
      @I18n() i18n: I18nContext,
    ) {
      const lang = getLang(i18n);
      return this.roleService.updateRoleWithPermissions(roleId, dto, lang);
    }
}
