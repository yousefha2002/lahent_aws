import { Controller, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from '../store/entities/store.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { Owner } from '../owner/entities/owner.entity';

@ApiSecurity('access-token')
@ApiTags('Deletion')
@Controller('deletion')
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @UseGuards(CustomerGuard)
  @Delete('soft-customer')
  @ApiOperation({ summary: 'Soft delete customer account' })
  @ApiResponse({ status: 200, description: 'Customer soft deleted successfully' })
  softDeleteCustomer(@CurrentUser() customer: Customer) {
    return this.deletionService.softDeleteCustomer(customer);
  }

  @UseGuards(AdminGuard)
  @Put('restore-customer/:customerId')
  @ApiOperation({ summary: 'Restore a soft-deleted customer by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer restored successfully' })
  restoreCustomer(@Param('customerId') customerId: number) {
    return this.deletionService.restoreCustomer(customerId);
  }

  @UseGuards(StoreOrOwnerGuard)
  @Delete('soft-store')
  @ApiOperation({ summary: 'Soft delete a store (Owner or Store Admin)' })
  @ApiResponse({ status: 200, description: 'Store soft deleted successfully' })
  softDeleteStore(@CurrentUser() store: Store) {
    return this.deletionService.softDeleteStore(store);
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
  softDeleteOwner(@CurrentUser() owner: Owner) {
    return this.deletionService.softDeleteOwner(owner);
  }

  @UseGuards(AdminGuard)
  @Put('restore/:ownerId')
  @ApiOperation({ summary: 'Restore a soft-deleted owner by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Owner restored successfully' })
  restoreOwner(@Param('ownerId') ownerId: number) {
    return this.deletionService.restoreOwner(ownerId);
  }
}