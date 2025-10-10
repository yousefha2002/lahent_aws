import { Body, Controller, Post } from '@nestjs/common';
import { StoreCommissionService } from './store_commission.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { StoreCommissionDto } from './dto/store_comimssion.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateStoreCommissionDto } from './dto/create_store_commission.dto';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('store-commission')
export class StoreCommissionController {
  constructor(private readonly storeCommissionService: StoreCommissionService) {}

  @Serilaize(StoreCommissionDto)
  @PermissionGuard([RoleStatus.ADMIN])
  @ApiOperation({ summary: 'Create or update commission for a store' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateStoreCommissionDto })
  @ApiResponse({
    status: 201,
    description: 'Store commission created or updated successfully',
    type: StoreCommissionDto,
  })
  @Post()
  async create(@Body() dto: CreateStoreCommissionDto) {
    return this.storeCommissionService.setCommission(dto.storeId, dto.commissionPercent);
  }

}
