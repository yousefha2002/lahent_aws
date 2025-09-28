import {Injectable,CanActivate,ExecutionContext,UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from '../enums/role_status';
import { StoreService } from 'src/modules/store/services/store.service';

@Injectable()
    export class StoreGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private storeService: StoreService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;

        if (!token) {
        throw new UnauthorizedException('Store must be logged in');
        }

        try {
        const decoded = await this.jwtService.verifyAsync(token, {
            secret: 'token',
        });

        if (decoded.role !== RoleStatus.STORE) {
            throw new UnauthorizedException('Unauthorized role');
        }

        const store = await this.storeService.storeById(decoded.id);
        if (!store) {
            throw new UnauthorizedException('Store not found');
        }

        request.currentUser = store;
        return !!decoded.id;
        } catch {
        throw new UnauthorizedException('Invalid or expired token');
        }
    }
}