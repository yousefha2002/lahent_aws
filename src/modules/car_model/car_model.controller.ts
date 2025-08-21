import { Body, Controller, Get, Param, Post, Put, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CarModelService } from './car_model.service';
import { CreateCarModelDto } from './dto/create_car_model.dto';
import { UpdateCarModelDto } from './dto/update_car_model.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Language } from 'src/common/enums/language';

@Controller('car-model')
export class CarModelController {
  constructor(private readonly carModelService: CarModelService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(
    @Body() dto: CreateCarModelDto,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.carModelService.create(dto, lang);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarModelDto,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.carModelService.update(id, dto, lang);
  }

  @Get()
  getAll() {
    return this.carModelService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number, @Query('lang') lang: Language = Language.en) {
    return this.carModelService.getOneOrFail(id, lang);
  }
}