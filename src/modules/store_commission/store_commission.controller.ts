import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StoreCommissionService } from './store_commission.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { StoreCommissionDto } from './dto/store_comimssion.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateStoreCommissionDto } from './dto/create_store_commission.dto';
import { AdminGuard } from 'src/common/guards/roles/admin.guard';

@Controller('store-commission')
export class StoreCommissionController {
  constructor(private readonly storeCommissionService: StoreCommissionService) {}

  @Serilaize(StoreCommissionDto)
  @UseGuards(AdminGuard)
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
