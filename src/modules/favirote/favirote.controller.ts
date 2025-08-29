import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FaviroteService } from './favirote.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('favorite')
export class FaviroteController {
  constructor(private readonly faviroteService: FaviroteService) {}

  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @Post('toggle/:storeId')
  @ApiOperation({ summary: 'Toggle favorite store for the current customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to toggle favorite', example: 1 })
  @ApiResponse({status: 200,schema: {example: {message: 'Store added to favorites'}}})
  add(@Param('storeId') storeId: string, @CurrentUser() user: Customer,@Query('lang') lang=Language.en) {
    return this.faviroteService.toggleFavorite(user.id, +storeId,lang);
  }

  @UseGuards(CustomerGuard)
  @Delete(':storeId')
  @ApiOperation({ summary: 'Remove a store from the customer favorites' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', description: 'ID of the store to remove from favorites', example: 1 })
  @ApiResponse({status: 200,schema: {example: {message: 'Store removed from favorites'}}})
  remove(@Param('storeId') storeId: string, @CurrentUser() user: Customer,@Query('lang') lang=Language.en) {
    return this.faviroteService.removeFavorite(user.id, +storeId,lang);
  }
}
