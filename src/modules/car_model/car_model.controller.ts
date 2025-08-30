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
import { CarModelService } from './car_model.service';
import { CreateCarModelDto } from './dto/create_car_model.dto';
import { UpdateCarModelDto } from './dto/update_car_model.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarModelDto } from './dto/car-model.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('car-model')
export class CarModelController {
  constructor(private readonly carModelService: CarModelService) {}

  @ApiOperation({ summary: 'Create a car model (admin only)' })
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
    description: 'Car model created successfully',
    schema: { example: { message: 'Created successfully' } },
  })
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCarModelDto, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.carModelService.create(dto, lang);
  }

  @ApiOperation({ summary: 'Update a car model by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the car model to update', example: 1 })
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
    description: 'Car model updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarModelDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.carModelService.update(id, dto, lang);
  }

  @ApiOperation({ summary: 'Get all car models and their languages' })
  @ApiResponse({
    status: 200,
    description: 'List of car models',
    type: CarModelDto,
    isArray: true,
  })
  @Get()
  @Serilaize(CarModelDto)
  getAll(@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.carModelService.getAll(lang);
  }

  @ApiOperation({ summary: 'Get a car model by ID with its languages' })
  @ApiParam({ name: 'id', description: 'ID of the car model', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Car model details',
    type: CarModelDto,
  })
  @Get(':id')
  @Serilaize(CarModelDto)
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.carModelService.getOneOrFail(id, lang);
  }
}