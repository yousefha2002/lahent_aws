import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CarModelService } from './car_model.service';
import { CreateCarModelDto } from './dto/create_car_model.dto';
import { UpdateCarModelDto } from './dto/update_car_model.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Language } from 'src/common/enums/language';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarModelDto } from './dto/car-model.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

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
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  create(
    @Body() dto: CreateCarModelDto,@Req() req
  ) {
    return this.carModelService.create(dto, req.lang);
  }

  @ApiOperation({ summary: 'update a car model by ID (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the car model to update',
    example: 1,
  })
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
    schema: {
      example: {
        message: 'Updated successfully',
      },
    },
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarModelDto,
    @Req() req,
  ) {
    return this.carModelService.update(id, dto, req.lang);
  }

  @ApiOperation({ summary: 'Get all car model and its languages' })
  @ApiResponse({
    status: 200,
    description: 'car models',
    type: CarModelDto,
    isArray: true,
  })
  @Get()
  @Serilaize(CarModelDto)
  getAll(@Req() req) {
    return this.carModelService.getAll(req.lang);
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
    @Req() req,
  ) {
    return this.carModelService.getOneOrFail(id, req.lang);
  }
}
