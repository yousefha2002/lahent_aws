import { Controller, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@ApiSecurity('access-token')
@ApiTags('Deletion')
@Controller('deletion')
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN],PermissionKey.deleteCustomer)
  @Delete('soft-customer')
  @ApiOperation({ summary: 'Soft delete customer account' })
  @ApiResponse({ status: 200, description: 'Customer soft deleted successfully' })
  @ApiQuery({ name: 'customerId', required: false, example: 1 })
  softDeleteCustomer(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.deletionService.softDeleteCustomer(context);
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.RestoreCustomer)
  @Put('restore-customer/:customerId')
  @ApiOperation({ summary: 'Restore a soft-deleted customer by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer restored successfully' })
  restoreCustomer(@Param('customerId') customerId: number) {
    return this.deletionService.restoreCustomer(customerId);
  }

  @PermissionGuard([RoleStatus.STORE],PermissionKey.deleteStore)
  @Delete('soft-store')
  @ApiOperation({ summary: 'Soft delete a store (Owner or Store Admin)' })
  @ApiResponse({ status: 200, description: 'Store soft deleted successfully' })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  softDeleteStore(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.deletionService.softDeleteStore(context);
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.RestoreStore)
  @Put('restore-store/:storeId')
  @ApiOperation({ summary: 'Restore a soft-deleted store by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Store restored successfully' })
  restoreStore(@Param('storeId') storeId: number) {
    return this.deletionService.restoreStore(storeId);
  }

  @PermissionGuard([RoleStatus.OWNER],PermissionKey.deleteOwner)
  @Delete('soft')
  @ApiOperation({ summary: 'Soft delete owner account (and related stores)' })
  @ApiResponse({ status: 200, description: 'Owner soft deleted successfully' })
  @ApiQuery({ name: 'ownerId', required: false, example: 1 })
  softDeleteOwner(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.deletionService.softDeleteOwner(context);
  }

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.RestoreOwner)
  @Put('restore/:ownerId')
  @ApiOperation({ summary: 'Restore a soft-deleted owner by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Owner restored successfully' })
  restoreOwner(@Param('ownerId') ownerId: number) {
    return this.deletionService.restoreOwner(ownerId);
  }
}