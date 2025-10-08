import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CustomerGuard } from 'src/common/guards/roles/customer.guard';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { CreateCarDto } from './dto/create_car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CustomerCarListDto } from './dto/customer-car-list.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @UseGuards(CustomerGuard, CompletedProfileGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new car for the customer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCarDto })
  @ApiResponse({
    status: 201,
    description: 'Car created successfully',
    schema: { example: { message: 'Car created successfully', carId: 1 } },
  })
  create(
    @Body() dto: CreateCarDto,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.carService.create(context.id, dto, lang);
  }

  @Serilaize(CustomerCarListDto)
  @UseGuards(CustomerGuard)
  @Get('all/byCustomer/saved')
  @ApiOperation({ summary: 'Get all saved cars for the current customer' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'List of saved cars for the customer',
    type: CustomerCarListDto,
  })
  getAllCustomerCars(
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.carService.getAllCustomerCars(context.id, lang);
  }

  @Serilaize(CustomerCarListDto)
  @UseGuards(CustomerGuard)
  @Get(':carId/byCustomer')
  @ApiOperation({ summary: 'Get details of a specific car for the current customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'carId', description: 'ID of the car', example: 1 })
  @ApiResponse({
    status: 200,
    type: CustomerCarListDto,
    description: 'Details of the requested car for the customer',
  })
  getCustomerCar(
    @CurrentUser() user: CurrentUserType,
    @Param('carId') carId: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.carService.getCustomerCar(context.id, carId, lang);
  }

  @UseGuards(CustomerGuard)
  @Delete(':carId')
  @ApiOperation({ summary: 'Delete a specific car for the current customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'carId', description: 'ID of the car to delete', example: 1 })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Car deleted successfully' } },
  })
  deleteCustomerCar(
    @CurrentUser() user: CurrentUserType,
    @Param('carId') carId: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.carService.delete(context.id, carId, lang);
  }

  @UseGuards(CustomerGuard)
  @Put(':carId')
  @ApiOperation({ summary: 'Update a specific car for the current customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'carId', description: 'ID of the car to update', example: 1 })
  @ApiBody({ type: UpdateCarDto })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Car updated successfully' } },
  })
  update(
    @Body() dto: UpdateCarDto,
    @CurrentUser() user: CurrentUserType,
    @Param('carId') carId: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.carService.update(context.id, carId, dto, lang);
  }
}