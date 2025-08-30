import { Controller, Delete, Post, Param, UseGuards } from '@nestjs/common';
import { FaviroteService } from './favirote.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('favorite')
export class FaviroteController {
  constructor(private readonly faviroteService: FaviroteService) {}

  @UseGuards(CustomerGuard, CompletedProfileGuard)
  @Post('toggle/:storeId')
  @ApiOperation({ summary: 'Toggle favorite store for the current customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to toggle favorite', example: 1 })
  @ApiResponse({ status: 200, schema: { example: { message: 'Store added to favorites' } } })
  toggleFavorite(
    @Param('storeId') storeId: string,
    @CurrentUser() user: Customer,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.faviroteService.toggleFavorite(user.id, +storeId, lang);
  }

  @UseGuards(CustomerGuard)
  @Delete(':storeId')
  @ApiOperation({ summary: 'Remove a store from the customer favorites' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to remove from favorites', example: 1 })
  @ApiResponse({ status: 200, schema: { example: { message: 'Store removed from favorites' } } })
  removeFavorite(
    @Param('storeId') storeId: string,
    @CurrentUser() user: Customer,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.faviroteService.removeFavorite(user.id, +storeId, lang);
  }
}