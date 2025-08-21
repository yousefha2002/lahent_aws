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

@Controller('favorite')
export class FaviroteController {
  constructor(private readonly faviroteService: FaviroteService) {}

  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @Post(':storeId')
  add(@Param('storeId') storeId: string, @CurrentUser() user: Customer,@Query('lang') lang=Language.en) {
    return this.faviroteService.addFavorite(user.id, +storeId,lang);
  }

  @UseGuards(CustomerGuard)
  @Delete(':storeId')
  remove(@Param('storeId') storeId: string, @CurrentUser() user: Customer,@Query('lang') lang=Language.en) {
    return this.faviroteService.removeFavorite(user.id, +storeId,lang);
  }
}
