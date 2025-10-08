import { Controller, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { CustomerGuard } from 'src/common/guards/roles/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { OwnerGuard } from 'src/common/guards/roles/owner.guard';
import { StoreGuard } from 'src/common/guards/roles/store.guard';
import { AdminGuard } from 'src/common/guards/roles/admin.guard';
import { CurrentUserType } from 'src/common/types/current-user.type';

@ApiSecurity('access-token')
@ApiTags('Deletion')
@Controller('deletion')
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @UseGuards(CustomerGuard)
  @Delete('soft-customer')
  @ApiOperation({ summary: 'Soft delete customer account' })
  @ApiResponse({ status: 200, description: 'Customer soft deleted successfully' })
  softDeleteCustomer(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.deletionService.softDeleteCustomer(context);
  }

  @UseGuards(AdminGuard)
  @Put('restore-customer/:customerId')
  @ApiOperation({ summary: 'Restore a soft-deleted customer by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer restored successfully' })
  restoreCustomer(@Param('customerId') customerId: number) {
    return this.deletionService.restoreCustomer(customerId);
  }

  @UseGuards(StoreGuard)
  @Delete('soft-store')
  @ApiOperation({ summary: 'Soft delete a store (Owner or Store Admin)' })
  @ApiResponse({ status: 200, description: 'Store soft deleted successfully' })
  softDeleteStore(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.deletionService.softDeleteStore(context);
  }

  @UseGuards(AdminGuard)
  @Put('restore-store/:storeId')
  @ApiOperation({ summary: 'Restore a soft-deleted store by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Store restored successfully' })
  restoreStore(@Param('storeId') storeId: number) {
    return this.deletionService.restoreStore(storeId);
  }

  @UseGuards(OwnerGuard)
  @Delete('soft')
  @ApiOperation({ summary: 'Soft delete owner account (and related stores)' })
  @ApiResponse({ status: 200, description: 'Owner soft deleted successfully' })
  softDeleteOwner(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.deletionService.softDeleteOwner(context);
  }

  @UseGuards(AdminGuard)
  @Put('restore/:ownerId')
  @ApiOperation({ summary: 'Restore a soft-deleted owner by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Owner restored successfully' })
  restoreOwner(@Param('ownerId') ownerId: number) {
    return this.deletionService.restoreOwner(ownerId);
  }
}