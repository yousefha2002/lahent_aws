import {Body,Controller,Get,Param,Post,Put,UseGuards} from '@nestjs/common';
import { CarBrandService } from './car_brand.service';
import { CreateCarBrandDto } from './dto/create_car_brand.dto';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarBrandDto } from './dto/car-brand.dto';
import {ApiBody,ApiOperation,ApiParam,ApiResponse,ApiSecurity} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('car-brand')
export class CarBrandController {
  constructor(private readonly carBrandService: CarBrandService) {}

  @ApiOperation({ summary: 'Create a car brand (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        names: { type: 'object', example: { en: 'honday', ar: 'هونداي' } },
      },
      required: ['names'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Car brand created successfully',
    schema: { example: { message: 'Created successfully' } },
  })
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCarBrandDto, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.carBrandService.create(dto, lang);
  }

  @ApiOperation({ summary: 'Update a car brand by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the car brand to update', example: 1 })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        names: { type: 'object', example: { en: 'honday', ar: 'هونداي' } },
      },
      required: ['names'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Car brand updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCarBrandDto) {
    return this.carBrandService.update(id, dto);
  }

  @ApiOperation({ summary: 'Get all car brands and their languages' })
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

  @Get('admin')
  @UseGuards(AdminGuard)
  @Serilaize(CarBrandDto)
  getAllAdmin() {
    return this.carBrandService.getAll();
  }
}
