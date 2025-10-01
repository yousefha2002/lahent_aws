import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CouponDto } from './dto/coupon.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { PaginatedCouponDto } from './dto/paginated-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseGuards(AdminGuard)
  @Serilaize(CouponDto)
  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 201, description: 'Created coupon', type: CouponDto })
  create(@Body() dto: CreateCouponDto, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.couponService.createCoupon(dto, lang);
  }

  @UseGuards(AdminGuard)
  @Serilaize(CouponDto)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'Coupon ID', example: 1 })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: 'Updated coupon', type: CouponDto })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  update(@Param('id') id: number, @Body() dto: UpdateCouponDto, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.couponService.updateCoupon(id, dto, lang);
  }

  @UseGuards(AdminGuard)
  @Get('admin')
  @Serilaize(PaginatedCouponDto)
  @ApiOperation({ summary: 'Get all coupons with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'List of coupons', type: PaginatedCouponDto })
  async getAllForAdmin(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.couponService.findAllForAdmin(page, limit);
  }
}