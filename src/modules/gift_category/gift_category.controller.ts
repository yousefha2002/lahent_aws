import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GiftCategoryService } from './gift_category.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { GiftCategoryDto } from './dto/gift-category.dto';
import { ActionGiftCategoryDto } from './dto/action-gift-category.dto';
import { GiftCategoryListDto } from './dto/gift-category-list.dto';
import { Language } from 'src/common/enums/language';

@Controller('gift-category')
export class GiftCategoryController {
  constructor(private readonly giftCategoryService: GiftCategoryService) {}

  @Serilaize(GiftCategoryDto)
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() body: ActionGiftCategoryDto,@Query('lang') lang=Language.en) {
    return this.giftCategoryService.create(body,lang);
  }

  @Serilaize(GiftCategoryDto)
  @UseGuards(AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: ActionGiftCategoryDto,@Query('lang') lang=Language.en) {
    return this.giftCategoryService.update(id, body,lang);
  }

  @Serilaize(GiftCategoryListDto)
  @Get('with-templates')
  async findAllWithTemplates() {
    return this.giftCategoryService.findAllWithTemplates()
  }
}