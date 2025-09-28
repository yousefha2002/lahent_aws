import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VariantCategoryService } from './variant_category.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { VariantCategoryDto } from './dto/variant_category.dto';
import { CreateVariantCategoryDto } from './dto/create_variant_category.dto';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('variant-category')
export class VariantCategoryController {
  constructor(private readonly variantCategoryService: VariantCategoryService) {}

  @Serilaize(VariantCategoryDto)
  @UseGuards(AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new variant category' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateVariantCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Variant category created successfully',
    type: VariantCategoryDto,
  })
  async create(@Body() dto: CreateVariantCategoryDto) {
    return this.variantCategoryService.create(dto);
  }

  @Serilaize(VariantCategoryDto)
  @Get()
  @ApiOperation({ summary: 'Get all variant categories' })
  @ApiResponse({type: [VariantCategoryDto]})
  getAll(@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    return this.variantCategoryService.getAll(lang)
  }

  @UseGuards(AdminGuard)
  @Serilaize(VariantCategoryDto)
  @Get('admin')
  @ApiOperation({ summary: 'Get all variant categories for admin' })
  @ApiSecurity('access-token')
  @ApiResponse({type: [VariantCategoryDto]})
  getAllForAdmin()
  {
    return this.variantCategoryService.getAll()
  }
}
