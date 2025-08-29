import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { VariantCategoryService } from './variant_category.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { VariantCategoryDto } from './dto/variant_category.dto';
import { CreateVariantCategoryDto } from './dto/create_variant_category.dto';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
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
  @ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
  @ApiResponse({
    status: 200,
    description: 'List of all variant categories',
    type: [VariantCategoryDto],
  })
  getAll(@Query('lang') lang=Language.ar)
  {
    return this.variantCategoryService.getAll(lang)
  }
}
