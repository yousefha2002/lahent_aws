import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { VariantCategoryService } from './variant_category.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { VariantCategoryDto } from './dto/variant_category.dto';
import { CreateVariantCategoryDto } from './dto/create_variant_category.dto';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UpdateVariantCategoryDto } from './dto/update_variant_category.dto';

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
    status: 200,
    schema: { example: { message: 'created successfully' } },
  })
  async create(@Body() dto: CreateVariantCategoryDto,@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.variantCategoryService.create(dto,lang);
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

  @UseGuards(AdminGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a variant category' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateVariantCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Variant category updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  updateVariantCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateVariantCategoryDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.variantCategoryService.update(id, body, lang);
  }
}
