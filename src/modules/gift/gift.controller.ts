import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { PaginatedGiftDto } from './dto/gift.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @ApiOperation({ summary: 'Send a gift (customer only)' })
  @ApiSecurity('access-token')
  @ApiBody({type:CreateGiftDto})
  @ApiResponse({
    status: 201,
    schema: {
      example: { message: 'Sent successfully' },
    },
  })
  @Post('create')
  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  sendGift(
    @Body() body: CreateGiftDto,
    @CurrentUser() sender: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = sender
    return this.giftService.createGift(context, body, lang);
  }

  @ApiOperation({ summary: 'Respond to a gift (accept or reject)' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      example: { accept: true },
    },
  })
  @Patch(':id/respond')
  @PermissionGuard([RoleStatus.CUSTOMER], CompletedProfileGuard)
  async respondToGift(
    @Param('id') giftId: number,
    @Body('accept') accept: boolean,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const { context } = user;
    return this.giftService.respondToGift(giftId, context, accept, lang);
  }

  @Serilaize(PaginatedGiftDto)
  @ApiOperation({ summary: 'Get gifts for current customer' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, type: PaginatedGiftDto })
  @Get('my-gifts')
  @ApiQuery({ name: 'customerId', required: false, example: 1 })
  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN],PermissionKey.ViewCustomerGifts)
  async getMyGifts(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const {context} = user
    return this.giftService.getGiftsByCustomer(context.id, Number(page), Number(limit));
  }
}