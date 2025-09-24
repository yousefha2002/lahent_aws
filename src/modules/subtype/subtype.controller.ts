import {Body,Controller,Delete,Get,Param,Post,Put,UseGuards} from '@nestjs/common';
import { SubtypeService } from './subtype.service';
import { CreateSubTypeDto } from './dto/create-subType.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UpdateSubTypeDto } from './dto/update-subType.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { SubTypeDto } from './dto/subType.dto';
import {ApiBody,ApiOperation,ApiParam,ApiResponse,ApiSecurity} from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('subtype')
export class SubtypeController {
  constructor(private readonly subtypeService: SubtypeService) {}

  @ApiOperation({ summary: 'Create a new sub type (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nameEn: { type: 'string', example: 'store' },
        nameAr: { type: 'string', example: 'متجر' },
        typeId: { type: 'number', example: 1 },
      },
      required: ['nameEn', 'nameAr', 'typeId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sub Type created successfully',
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @Post('/create')
  @UseGuards(AdminGuard)
  createSubType(@Body() body: CreateSubTypeDto) {
    return this.subtypeService.createSubType(body);
  }

  @ApiOperation({ summary: 'Update sub type by ID (admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'subTypeId',
    description: 'ID of the sub type to update',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nameEn: { type: 'string', example: 'sweets' },
        nameAr: { type: 'string', example: 'حلويات' },
      },
      required: ['nameEn', 'nameAr'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sub Type updated successfully',
    schema: {
      example: { message: 'Updated successfully' },
    },
  })
  @Put('/update/:subTypeId')
  @UseGuards(AdminGuard)
  updateSubType(
    @Body() body: UpdateSubTypeDto,
    @Param('subTypeId') subTypeId: number,
  ) {
    return this.subtypeService.updateSubType(+subTypeId, body);
  }

  @ApiOperation({ summary: 'delete sub type by ID (admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'subTypeId',
    description: 'ID of the sub type to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sub Type deleted successfully',
    schema: {
      example: { message: 'deleted successfully' },
    },
  })
  @Delete('/:subTypeId')
  @UseGuards(AdminGuard)
  deleteSubType(@Param('subTypeId') subTypeId: number) {
    return this.subtypeService.deleteSubType(+subTypeId);
  }

  @ApiOperation({ summary: 'Get a sub types by type ID with its languages' })
  @ApiParam({ name: 'typeId', description: 'ID of the type', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Type details',
    type: SubTypeDto,
    isArray: true,
  })
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
  @UseGuards(AdminGuard)
  @Serilaize(SubTypeDto)
  fetchAllByTypeIdAdmin(@Param('typeId') typeId: string) {
    return this.subtypeService.getAllSubTypesByTypeId(+typeId);
  }
}
