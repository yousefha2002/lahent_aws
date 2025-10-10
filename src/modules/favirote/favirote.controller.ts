import { Controller, Delete, Post, Param, UseGuards } from '@nestjs/common';
import { FaviroteService } from './favirote.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('favorite')
export class FaviroteController {
  constructor(private readonly faviroteService: FaviroteService) {}

  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  @Post('toggle/:storeId')
  @ApiOperation({ summary: 'Toggle favorite store for the current customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to toggle favorite', example: 1 })
  @ApiResponse({ status: 200, schema: { example: { message: 'Store added to favorites' } } })
  toggleFavorite(
    @Param('storeId') storeId: string,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.faviroteService.toggleFavorite(context.id, +storeId, lang);
  }

  @PermissionGuard([RoleStatus.CUSTOMER])
  @Delete(':storeId')
  @ApiOperation({ summary: 'Remove a store from the customer favorites' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to remove from favorites', example: 1 })
  @ApiResponse({ status: 200, schema: { example: { message: 'Store removed from favorites' } } })
  removeFavorite(
    @Param('storeId') storeId: string,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.faviroteService.removeFavorite(context.id, +storeId, lang);
  }
}