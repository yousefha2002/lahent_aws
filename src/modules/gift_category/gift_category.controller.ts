import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GiftCategoryService } from './gift_category.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import {
  GiftCategoryDto,
  GiftCategoryDtoWithMessage,
} from './dto/gift-category.dto';
import { CreateGiftCategoryDto } from './dto/action-gift-category.dto';
import { Language } from 'src/common/enums/language';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('gift-category')
export class GiftCategoryController {
  constructor(private readonly giftCategoryService: GiftCategoryService) {}

  @ApiOperation({ summary: 'Create a Gift Category (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        languages: {
          type: 'array',
          example: [
            { languageCode: 'en', title: 'eid mubark' },
            { languageCode: 'ar', title: 'عيد مبارك' },
          ],
        },
      },
      required: ['languages'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gift category created successfully',
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @Serilaize(GiftCategoryDtoWithMessage)
  @UseGuards(AdminGuard)
  @Post()
  async create(
    @Body() body: CreateGiftCategoryDto,
    @Query('lang') lang = Language.en,
  ) {
    return this.giftCategoryService.create(body, lang);
  }

  @ApiOperation({ summary: 'update a gift category by ID (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the gift category to update',
    example: 1,
  })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        languages: {
          type: 'array',
          example: [
            { languageCode: 'en', title: 'eid mubark' },
            { languageCode: 'ar', title: 'عيد مبارك' },
          ],
        },
      },
      required: ['languages'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gift category updated successfully',
    schema: {
      example: {
        message: 'Gift category successfully',
      },
    },
  })
  @Serilaize(GiftCategoryDto)
  @UseGuards(AdminGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateGiftCategoryDto,
    @Query('lang') lang = Language.en,
  ) {
    return this.giftCategoryService.update(id, body, lang);
  }

  @ApiOperation({ summary: 'Get all Gift category and its languages' })
  @ApiResponse({
    status: 200,
    description: 'all gift category',
    type: GiftCategoryDto,
    isArray: true,
  })
  @Serilaize(GiftCategoryDto)
  @Get('with-templates')
  async findAllWithTemplates(@Query('lang') lang = Language.en) {
    return this.giftCategoryService.findAllWithTemplates(lang);
  }
}
