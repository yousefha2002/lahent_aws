import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CouponDto } from './dto/coupon.dto';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { ValidateCouponDTO } from './dto/validate-coupon';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CouponValidateDto } from './dto/coupon-validate.dto';

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
  create(@Body() dto: CreateCouponDto,@Req() req) {
    return this.couponService.createCoupon(dto,req.lang);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(CouponDto)
  @Post('/store/create')
  @ApiOperation({ summary: 'Create a new coupon by store' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCouponDto })
  @ApiQuery({ name: 'lang', required: false, enum: Language, example: 'en' })
  @ApiResponse({ status: 201, description: 'Created coupon', type: CouponDto })
  createByStore(@Body() dto: CreateCouponDto, @CurrentUser() store: Store,@Req() req) {
    return this.couponService.createCoupon(dto,req.lang, store.id);
  }

  @Serilaize(CouponValidateDto)
  @Get('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiQuery({ name: 'code', required: true, description: 'Coupon code to validate', example: 'SUMMER2025' })
  @ApiResponse({ status: 200, description: 'Coupon validation result', type: CouponValidateDto })
  validateCoupon(@Body() dto:ValidateCouponDTO,@Req() req)
  {
    return this.couponService.validateCoupon(dto.code,req.lang)
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
  update(@Param('id') id: number, @Body() dto: UpdateCouponDto,@Req() req) {
    return this.couponService.updateCoupon(id ,dto,req.lang);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(CouponDto)
  @Patch('/store/update/:id')
  @ApiOperation({ summary: 'Update a coupon by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'Coupon ID', example: 1 })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: 'Updated coupon', type: CouponDto })
  updateByStore(
    @Param('id') id: number,
    @Body() dto: UpdateCouponDto,
    @CurrentUser() store: Store,
    @Req() req
  ) {
    return this.couponService.updateCoupon(id, dto,req.lang, store.id);
  }
}
