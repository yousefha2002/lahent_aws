import {Body,Controller,Get,Param,Post,Put} from '@nestjs/common';
import { CarBrandService } from './car_brand.service';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarBrandDto } from './dto/car-brand.dto';
import {ApiBody,ApiOperation,ApiParam,ApiResponse,ApiSecurity} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('car-brand')
export class CarBrandController {
  constructor(private readonly carBrandService: CarBrandService) {}

  @ApiOperation({ summary: 'Create a car brand (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({type:UpdateCarBrandDto})
  @ApiResponse({
    status: 201,
    description: 'Car brand created successfully',
    schema: { example: { message: 'Created successfully' } },
  })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.CreateCarBrand)
  @Post()
  create(@Body() dto: UpdateCarBrandDto,@CurrentUser() user:CurrentUserType, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    const {actor} = user
    return this.carBrandService.create(dto,actor, lang);
  }

  @ApiOperation({ summary: 'Update a car brand by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the car brand to update', example: 1 })
  @ApiSecurity('access-token')
  @ApiBody({type:UpdateCarBrandDto})
  @ApiResponse({
    status: 201,
    description: 'Car brand updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateCarBrand)
  @Put(':id')
  update(@Param('id') id: number,@CurrentUser() user:CurrentUserType, @Body() dto: UpdateCarBrandDto,@I18n() i18n: I18nContext) {
    const {actor} = user
    const lang = getLang(i18n);
    return this.carBrandService.update(id ,actor, dto,lang);
  }

  @ApiOperation({ summary: 'Get all car brands and their languages' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'List of car brands',
    type: CarBrandDto,
    isArray: true,
  })
  @Get()
  @Serilaize(CarBrandDto)
  getAll(@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.carBrandService.getAll(lang);
  }

  @ApiOperation({ summary: 'Get all car brands for admin' })
  @ApiResponse({type:[CarBrandDto]})
  @Get('admin')
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewCarBrand)
  @Serilaize(CarBrandDto)
  getAllAdmin() {
    return this.carBrandService.getAll();
  }
}
