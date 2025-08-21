import { Controller, Get, Param } from '@nestjs/common';
import { OpeningHourService } from './opening_hour.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { OpeningHourDTO } from './dto/opening-hour.dto';

@Controller('opening-hour')
export class OpeningHourController {
  constructor(private readonly openingHourService: OpeningHourService) {}

  @Serilaize(OpeningHourDTO)
  @Get(':storeId')
  getOpeningHoursByStore(@Param('storeId') storeId:number)
  {
    return this.openingHourService.getOpeningHoursByStoreId(storeId)
  }
}
