import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CarTypeService } from './car_type.service';
import { CreateCarTypeDto } from './dto/create_car_type.dto';
import { UpdateCarTypeDto } from './dto/update_car_type.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarTypeDto } from './dto/car-type.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('car-type')
export class CarTypeController {
  constructor(private readonly carTypeService: CarTypeService) {}

  @ApiOperation({ summary: 'Create a car type (admin only)' })
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
    description: 'Car type created successfully',
    schema: { example: { message: 'Created successfully' } },
  })
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCarTypeDto, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.carTypeService.create(dto, lang);
  }

  @ApiOperation({ summary: 'Update a car type by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the car type to update', example: 1 })
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
    description: 'Car type updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarTypeDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.carTypeService.update(id, dto, lang);
  }

  @ApiOperation({ summary: 'Get all car types and their languages' })
  @ApiResponse({
    status: 200,
    description: 'List of car types',
    type: CarTypeDto,
    isArray: true,
  })
  @Get()
  @Serilaize(CarTypeDto)
  getAll(@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.carTypeService.getAll(lang);
  }

  @ApiOperation({ summary: 'Get a car type by ID with its languages' })
  @ApiParam({ name: 'id', description: 'ID of the car type', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Car type details',
    type: CarTypeDto,
  })
  @Get(':id')
  @Serilaize(CarTypeDto)
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.carTypeService.getOneOrFail(id, lang);
  }
}
