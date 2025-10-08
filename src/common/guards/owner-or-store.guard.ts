import {Injectable,CanActivate,ExecutionContext,UnauthorizedException,BadRequestException,ForbiddenException} from '@nestjs/common';
import { StoreService } from 'src/modules/store/services/store.service';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from '../enums/role_status';
import { OwnerService } from 'src/modules/owner/owner.service';

@Injectable()
export class OwnerOrStoreGuard implements CanActivate {
    constructor(
        private readonly storeService: StoreService,
        private readonly jwtService: JwtService,
        private ownerService: OwnerService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;
        if (!token) {
        throw new UnauthorizedException('You must be logged in');
        }

        let decoded;
        try {
        decoded = await this.jwtService.verifyAsync(token, {
            secret: 'token',
        });
        } catch {
        throw new UnauthorizedException('Invalid or expired token');
        }

        const user = decoded;

        if (user.role === RoleStatus.STORE) {
        const store = await this.storeService.getStoreById(user.id);
        request.currentUser = store;
        return true;
        }

        if (user.role === RoleStatus.OWNER) {
        const storeId = request.query.storeId;
        if (!storeId) throw new BadRequestException('storeId is required');

        const owner = await this.ownerService.findById(user.id);
        if (!owner) {
            throw new UnauthorizedException('Owner not found');
        }
        const store = await this.storeService.getStoreById(storeId);

        if (store.ownerId !== decoded.id) {
            throw new ForbiddenException('You are not owner of this store');
        }
        request.currentUser = store;
        return true;
        }

        throw new UnauthorizedException('Unauthorized role');
    }
}
