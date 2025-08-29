import { Controller, Get, Param } from '@nestjs/common';
import { OpeningHourService } from './opening_hour.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { OpeningHourDTO } from './dto/opening-hour.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('opening-hour')
export class OpeningHourController {
  constructor(private readonly openingHourService: OpeningHourService) {}

  @Serilaize(OpeningHourDTO)
  @Get(':storeId')
  @ApiOperation({ summary: 'Get opening hours of a store by its ID' })
  @ApiParam({ name: 'storeId', description: 'ID of the store', example: 1 })
  @ApiResponse({status: 200,description: 'List of opening hours for the store',type: [OpeningHourDTO]})
  getOpeningHoursByStore(@Param('storeId') storeId:number)
  {
    return this.openingHourService.getOpeningHoursByStoreId(storeId)
  }
}
