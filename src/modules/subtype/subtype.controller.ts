import {Body,Controller,Delete,Get,Param,Post,Put} from '@nestjs/common';
import { SubtypeService } from './subtype.service';
import { CreateSubTypeDto, UpdateSubTypeDto } from './dto/create-subType.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { SubTypeDto } from './dto/subType.dto';
import {ApiBody,ApiOperation,ApiParam,ApiResponse,ApiSecurity} from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('subtype')
export class SubtypeController {
  constructor(private readonly subtypeService: SubtypeService) {}

  @ApiOperation({ summary: 'Create a new sub type (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({type:CreateSubTypeDto})
  @ApiResponse({status: 201,schema: {example: {message: 'Created successfully'}}})
  @Post('/create')
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.CreateTypeOfStore)
  createSubType(@Body() body: CreateSubTypeDto,@CurrentUser() user:CurrentUserType,@I18n() i18n: I18nContext) {
    const {actor} = user
    const lang = getLang(i18n);
    return this.subtypeService.createSubType(body,actor,lang);
  }

  @ApiOperation({ summary: 'Update sub type by ID (admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({name: 'subTypeId',description: 'ID of the sub type to update',example: 1,})
  @ApiBody({type:UpdateSubTypeDto})
  @ApiResponse({status: 200,schema: {example: { message: 'Updated successfully' },},})
  @Put('/update/:subTypeId')
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateTypeOfStore)
  updateSubType(
    @Body() body: UpdateSubTypeDto,
    @CurrentUser() user:CurrentUserType,
    @Param('subTypeId') subTypeId: number,
    @I18n() i18n: I18nContext
  ) {
    const {actor} = user
    const lang = getLang(i18n);
    return this.subtypeService.updateSubType(+subTypeId, body,actor,lang);
  }

  @ApiOperation({ summary: 'delete sub type by ID (admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({name: 'subTypeId',description: 'ID of the sub type to delete',example: 1})
  @ApiResponse({
    status: 200,
    schema: {
      example: { message: 'deleted successfully' },
    },
  })
  @Delete('/:subTypeId')
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.DeleteTypeOfStore)
  deleteSubType(@Param('subTypeId') subTypeId: number,@CurrentUser() user:CurrentUserType,@I18n() i18n: I18nContext) {
    const {actor} = user
    const lang = getLang(i18n);
    return this.subtypeService.deleteSubType(+subTypeId,actor,lang);
  }

  @ApiOperation({ summary: 'Get a sub types by type ID with its languages' })
  @ApiParam({ name: 'typeId', description: 'ID of the type', example: 1 })
  @ApiResponse({status: 200,description: 'Type details',type: SubTypeDto,isArray: true,})
  @Get('byType/:typeId')
  @Serilaize(SubTypeDto)
  fetchAllByTypeId(
    @Param('typeId') typeId: string,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.subtypeService.getAllSubTypesByTypeId(+typeId, lang);
  }

  @Get('admin/byType/:typeId')
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewTypeOfStore)
  @Serilaize(SubTypeDto)
  fetchAllByTypeIdAdmin(@Param('typeId') typeId: string) {
    return this.subtypeService.getAllSubTypesByTypeId(+typeId);
  }
}
