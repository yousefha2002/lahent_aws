import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubtypeService } from './subtype.service';
import { CreateSubTypeDto } from './dto/create-subType.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UpdateSubTypeDto } from './dto/update-subType.dto';
import { Language } from 'src/common/enums/language';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { SubTypeDto } from './dto/subType.dto';

@Controller('subtype')
export class SubtypeController {
  constructor(private readonly subtypeService: SubtypeService) {}

  @Post('/create')
  @UseGuards(AdminGuard)
  createSubType(@Body() body: CreateSubTypeDto) {
    return this.subtypeService.createSubType(body);
  }

  @Put('/update/:subTypeId')
  @UseGuards(AdminGuard)
  updateSubType(
    @Body() body: UpdateSubTypeDto,
    @Param('subTypeId') subTypeId: number,
  ) {
    return this.subtypeService.updateSubType(+subTypeId, body);
  }

  @Delete('/:subTypeId')
  @UseGuards(AdminGuard)
  deleteSubType(@Param('subTypeId') subTypeId: number) {
    return this.subtypeService.deleteSubType(+subTypeId);
  }

  @Get('byType/:typeId')
  @Serilaize(SubTypeDto)
  fetchAllByTypeId(
    @Param('typeId') typeId: string,
    @Query('lang') lang: Language = Language.en,
  ) {
    return this.subtypeService.getAllSubTypesByTypeId(+typeId, lang);
  }
}
