import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleStatus } from '../enums/role_status';
import 'reflect-metadata';
import { RoleGuard } from '../guards/roles/role.guard';

export function PermissionGuard(allowedRoles?: RoleStatus[],permissionOrGuard?: string | any,...extraGuards: any[]) 
{
    let permissionKey: string | null = null;
    let guards: any[] = [];

    // 👇 إذا أرسل المستخدم string نعتبرها permission
    if (typeof permissionOrGuard === 'string') {
        permissionKey = permissionOrGuard;
        guards = extraGuards;
    } else if (permissionOrGuard) {
        // 👇 إذا أرسل guard نضيفه لقائمة الـ guards
        guards = [permissionOrGuard, ...extraGuards];
    }

    return applyDecorators(
        UseGuards(RoleGuard, ...guards),
        SetMetadata('allowedRoles', allowedRoles || []),
        SetMetadata('permissionKey', permissionKey),
    );
}
