import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from 'src/common/enums/role_status';

@Injectable()
export class AnyUserGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;
        if (!token) throw new UnauthorizedException('User must be logged in');

        try {
        const decoded = await this.jwtService.verifyAsync(token, { secret: 'token' });

        if (![RoleStatus.OWNER, RoleStatus.STORE, RoleStatus.CUSTOMER].includes(decoded.role)) {
            throw new UnauthorizedException('Unauthorized role');
        }

        request.currentUser = { id: decoded.id, role: decoded.role };
        return true;
        } catch {
        throw new UnauthorizedException('Invalid or expired token');
        }
    }
}