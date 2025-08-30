import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CarBrandService } from './car_brand.service';
import { CreateCarBrandDto } from './dto/create_car_brand.dto';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Language } from 'src/common/enums/language';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarBrandDto } from './dto/car-brand.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

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
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCarBrandDto, @Req() req) {
    return this.carBrandService.create(dto, req.lang);
  }

  @ApiOperation({ summary: 'update a car brand by ID (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the car brand to update',
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
    description: 'Car brand updated successfully',
    schema: {
      example: {
        message: 'Updated successfully',
      },
    },
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCarBrandDto,
  ) {
    return this.carBrandService.update(id, dto);
  }

  @ApiOperation({ summary: 'Get all car brand and its languages' })
  @ApiResponse({
    status: 200,
    description: 'car brands',
    type: CarBrandDto,
    isArray: true,
  })
  @Get()
  @Serilaize(CarBrandDto)
  getAll(@Req() req) {
    return this.carBrandService.getAll(req.lang);
  }

  @ApiOperation({ summary: 'Get a car brand by ID with its languages' })
  @ApiParam({ name: 'id', description: 'ID of the car brand', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Car model details',
    type: CarBrandDto,
  })
  @Get(':id')
  @Serilaize(CarBrandDto)
  getOne(@Param('id') id: number, @Req() req) {
    return this.carBrandService.getOneOrFail(id, req.lang);
  }
}
