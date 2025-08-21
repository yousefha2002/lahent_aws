import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseGuards(AdminGuard)
  @Serilaize(CouponDto)
  @Post()
  create(@Body() dto: CreateCouponDto,@Query('lang') lang=Language.en) {
    return this.couponService.createCoupon(dto,lang);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(CouponDto)
  @Post('/store/create')
  createByStore(@Body() dto: CreateCouponDto, @CurrentUser() store: Store,@Query('lang') lang=Language.en) {
    return this.couponService.createCoupon(dto,lang, store.id);
  }

  @Get('validate')
  validateCoupon(@Body() dto:ValidateCouponDTO,@Query('lang') lang=Language.en)
  {
    return this.couponService.validateCoupon(dto.code,lang)
  }

  @UseGuards(AdminGuard)
  @Serilaize(CouponDto)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCouponDto,@Query('lang') lang=Language.en) {
    return this.couponService.updateCoupon(id ,dto,lang);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(CouponDto)
  @Patch('/store/update/:id')
  updateByStore(
    @Param('id') id: number,
    @Body() dto: UpdateCouponDto,
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en
  ) {
    return this.couponService.updateCoupon(id, dto,lang, store.id);
  }
}
