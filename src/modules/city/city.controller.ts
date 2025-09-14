import { Controller, Get } from '@nestjs/common';
import { CityService } from './city.service';
import { cities } from 'src/common/constants/cities';
import { ApiOperation } from '@nestjs/swagger';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @ApiOperation({ summary: 'Get all cities' })
  @Get('all')
  getCities()
  {
    return cities
  }
}
