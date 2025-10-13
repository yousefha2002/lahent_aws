import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleProvider } from './providers/role.provider';
import { RolePermissionProvider } from './providers/role_permission.provider';

@Module({
  controllers: [RoleController],
  providers: [RoleService,...RoleProvider,...RolePermissionProvider],
  exports:[RoleService]
})
export class RoleModule {}
