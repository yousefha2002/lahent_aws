import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CarBrandService } from './car_brand.service';
import { CreateCarBrandDto } from './dto/create_car_brand.dto';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Language } from 'src/common/enums/language';

@Controller('car-brand')
export class CarBrandController {
  constructor(private readonly carBrandService: CarBrandService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCarBrandDto,@Query('lang') lang=Language.en) {
    return this.carBrandService.create(dto,lang);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateCarBrandDto,
    @Query('lang') lang=Language.en
  ) {
    return this.carBrandService.update(id, dto,lang);
  }

  @Get()
  getAll() {
    return this.carBrandService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number,@Query('lang') lang=Language.en) {
    return this.carBrandService.getOneOrFail(id,lang);
  }
}