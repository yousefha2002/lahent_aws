import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GiftTemplateService } from './gift_template.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateGiftTemplateDto } from './dto/create-gift-template.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import {
  GiftTemplateDto,
  PaginatedGiftTemplateDto,
} from './dto/gift-template.dto';
import { Language } from 'src/common/enums/language';

@Controller('gift-template')
export class GiftTemplateController {
  constructor(private readonly giftTemplateService: GiftTemplateService) {}

  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGiftTemplateDto,
    @Query('lang') lang = Language.en,
  ) {
    return this.giftTemplateService.create(body, file, lang);
  }

  @Serilaize(GiftTemplateDto)
  @UseGuards(AdminGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang = Language.en,
    @Body() body: CreateGiftTemplateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.giftTemplateService.update(body, id, lang, file);
  }

  @Serilaize(PaginatedGiftTemplateDto)
  @Get('by-category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.giftTemplateService.findByCategoryWithPagination(
      +categoryId,
      +page,
      +limit,
    );
  }
}
