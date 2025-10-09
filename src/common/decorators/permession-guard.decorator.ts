import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleStatus } from '../enums/role_status';
import 'reflect-metadata';
import { RoleGuard } from '../guards/roles/role.guard';

export function PermissionGuard(allowedRoles?: RoleStatus[]) {
    return applyDecorators(
        UseGuards(RoleGuard),
        Reflect.metadata('allowedRoles', allowedRoles),
    );
}