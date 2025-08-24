import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { VariantCategoryService } from './variant_category.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { VariantCategoryDto } from './dto/variant_category.dto';
import { CreateVariantCategoryDto } from './dto/create_variant_category.dto';
import { Language } from 'src/common/enums/language';

@Controller('variant-category')
export class VariantCategoryController {
  constructor(private readonly variantCategoryService: VariantCategoryService) {}

  @Serilaize(VariantCategoryDto)
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() dto: CreateVariantCategoryDto) {
    return this.variantCategoryService.create(dto);
  }

  @Serilaize(VariantCategoryDto)
  @Get()
  getAll(@Query('lang') lang=Language.ar)
  {
    return this.variantCategoryService.getAll(lang)
  }
}
