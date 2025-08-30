import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@Controller('gift-template')
export class GiftTemplateController {
  constructor(private readonly giftTemplateService: GiftTemplateService) {}

  @ApiOperation({ summary: 'Create a Gift Template (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        categoryId: { type: 'number', example: 1 },
      },
      required: ['image', 'categoryId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gift template created successfully',
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGiftTemplateDto,
    @Req() req,
  ) {
    return this.giftTemplateService.create(body, file, req.lang);
  }

  @ApiOperation({ summary: 'Update a Gift Template by ID (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'ID of the gift template to update',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        categoryId: { type: 'number', example: 1 },
      },
      required: ['image', 'categoryId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gift template updated successfully',
    schema: {
      example: {
        message: 'Updated successfully',
      },
    },
  })
  @Serilaize(GiftTemplateDto)
  @UseGuards(AdminGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() body: CreateGiftTemplateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.giftTemplateService.update(body, id, req.lang, file);
  }

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  @ApiOperation({
    summary: 'Get all gift templates and its languages by gift categoryId',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID of the gift Category',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'all gift templates by gift category',
    type: PaginatedGiftTemplateDto,
  })
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
