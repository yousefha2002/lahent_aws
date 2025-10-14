import { Controller, Get, Query } from '@nestjs/common';
import { UserPointHistoryService } from './user_point_history.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedUserPointHistoryDto } from './dto/user_point_history.dto';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('user-point-history')
export class UserPointHistoryController {
  constructor(private readonly userPointHistoryService: UserPointHistoryService) {}

  @Serilaize(PaginatedUserPointHistoryDto)
  @PermissionGuard([RoleStatus.CUSTOMER],PermissionKey.ViewCustomerPointsHistory)
  @Get()
  @ApiOperation({ summary: 'Get user points history with related orders and stores' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page' })
  @ApiQuery({ name: 'customerId', required: false, example: 1 })
  @ApiSecurity('access-token')
  @ApiOkResponse({ type: PaginatedUserPointHistoryDto })
  async getUserPoints(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.userPointHistoryService.getUserPoints(context.id, +page, +limit,lang);
  }
}
