import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserPointHistoryService } from './user_point_history.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedUserPointHistoryDto } from './dto/user_point_history.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('user-point-history')
export class UserPointHistoryController {
  constructor(private readonly userPointHistoryService: UserPointHistoryService) {}

  @Serilaize(PaginatedUserPointHistoryDto)
  @UseGuards(CustomerGuard)
  @Get()
  @ApiOperation({ summary: 'Get user points history with related orders and stores' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page' })
  @ApiSecurity('access-token')
  @ApiOkResponse({ type: PaginatedUserPointHistoryDto })
  async getUserPoints(
    @CurrentUser() user: Customer,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.userPointHistoryService.getUserPoints(user.id, +page, +limit,lang);
  }
}
