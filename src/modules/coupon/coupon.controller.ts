import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDTO } from './dto/validate-coupon';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CouponDto } from './dto/coupon.dto';
import { CouponValidateDto } from './dto/coupon-validate.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

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

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(CouponDto)
  @Post('/store/create')
  @ApiOperation({ summary: 'Create a new coupon by store' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCouponDto })
  @ApiQuery({ name: 'lang', required: false })
  @ApiResponse({ status: 201, description: 'Created coupon', type: CouponDto })
  createByStore(@Body() dto: CreateCouponDto, @CurrentUser() store: Store, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.couponService.createCoupon(dto, lang, store.id);
  }

  @Serilaize(CouponValidateDto)
  @Get('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiQuery({ name: 'code', required: true, description: 'Coupon code to validate', example: 'SUMMER2025' })
  @ApiResponse({ status: 200, description: 'Coupon validation result', type: CouponValidateDto })
  validateCoupon(@Body() dto: ValidateCouponDTO, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.couponService.validateCoupon(dto.code, lang);
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

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(CouponDto)
  @Patch('/store/update/:id')
  @ApiOperation({ summary: 'Update a coupon by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'Coupon ID', example: 1 })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: 'Updated coupon', type: CouponDto })
  updateByStore(@Param('id') id: number, @Body() dto: UpdateCouponDto, @CurrentUser() store: Store, @I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.couponService.updateCoupon(id, dto, lang, store.id);
  }
}