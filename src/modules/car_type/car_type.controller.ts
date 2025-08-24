import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CarTypeService } from './car_type.service';
import { CreateCarTypeDto } from './dto/create_car_type.dto';
import { UpdateCarTypeDto } from './dto/update_car_type.dto';
import { Language } from 'src/common/enums/language';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CarTypeDto } from './dto/car-type.dto';

@Controller('car-type')
export class CarTypeController {
  constructor(private readonly carTypeService: CarTypeService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(
    @Body() dto: CreateCarTypeDto,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.carTypeService.create(dto, lang);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarTypeDto,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.carTypeService.update(id, dto, lang);
  }

  @Get()
  @Serilaize(CarTypeDto)
  getAll() {
    return this.carTypeService.getAll();
  }

  @Get(':id')
  @Serilaize(CarTypeDto)
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.carTypeService.getOneOrFail(id, lang);
  }
}
