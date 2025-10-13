import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleProvider } from './providers/role.provider';
import { RolePermissionProvider } from './providers/role_permission.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService,...RoleProvider,...RolePermissionProvider],
  exports:[RoleService],
  imports:[forwardRef(()=>UserContextModule)]
})
export class RoleModule {}
