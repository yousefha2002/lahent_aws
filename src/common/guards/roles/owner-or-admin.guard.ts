import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from '../../enums/role_status';
import { AdminService } from 'src/modules/admin/admin.service';
import { OwnerService } from 'src/modules/owner/owner.service';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private adminService: AdminService,
        private ownerService: OwnerService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;

        if (!token) {
        throw new UnauthorizedException('Must be logged in');
        }

        try {
        const decoded = await this.jwtService.verifyAsync(token, {
            secret: 'token',
        });

        if (decoded.role === RoleStatus.ADMIN) {
            const admin = await this.adminService.findOneById(decoded.id);
            const ownerId = request.query.ownerId;
            if (!ownerId) {
            throw new UnauthorizedException('Admin must provide ownerId');
            }

            const owner = await this.ownerService.findById(+ownerId);
            request.currentUser = {
                type: RoleStatus.ADMIN,
                userId: admin.id,
                context: owner,
            };
            return true;
        }

        if (decoded.role === RoleStatus.OWNER) {
            const owner = await this.ownerService.findById(decoded.id);
            request.currentUser = {
                type: RoleStatus.OWNER,
                userId: owner.id,
                context: owner,
            };
            return true;
        }

        throw new UnauthorizedException('Unauthorized role');
        } catch {
        throw new UnauthorizedException('Invalid or expired token');
        }
    }
}