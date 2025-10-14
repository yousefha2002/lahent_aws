import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { RoleStatus } from 'src/common/enums/role_status';
import { UserContextService } from 'src/modules/user-context/user-context.service';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private userContextService: UserContextService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;
        if (!token) throw new UnauthorizedException('Must be logged in');

        const allowedRoles: RoleStatus[] = this.reflector.get('allowedRoles', context.getHandler()) || [];
        const permissionKey: string | null = this.reflector.get('permissionKey', context.getHandler()) || null;

        let decoded: any;
        try {
            decoded = await this.jwtService.verifyAsync(token, { secret: 'token' });
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
            throw new UnauthorizedException('Role not allowed');
        }

        const userContext = await this.userContextService.getUserContext(
            decoded.role,
            decoded.id,
            request.query,
            permissionKey,
        );

        request.currentUser = userContext;
        return true;
    }
}