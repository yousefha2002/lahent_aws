import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleStatus } from '../enums/role_status';
import 'reflect-metadata';
import { RoleGuard } from '../guards/roles/role.guard';

export function PermissionGuard(allowedRoles?: RoleStatus[],...extraGuards: any[]) {
    return applyDecorators(
        UseGuards(RoleGuard, ...extraGuards),
        Reflect.metadata('allowedRoles', allowedRoles),
    );
}