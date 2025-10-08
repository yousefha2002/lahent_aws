import {Injectable,CanActivate,ExecutionContext,UnauthorizedException} from '@nestjs/common';
import { StoreService } from 'src/modules/store/services/store.service';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from '../../enums/role_status';
import { AdminService } from 'src/modules/admin/admin.service';
@Injectable()
export class StoreOrAdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private adminService: AdminService,
        private storeService: StoreService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;
        if (!token) throw new UnauthorizedException('Must be logged in');

        const decoded = await this.jwtService.verifyAsync(token, { secret: 'token' });

        if (decoded.role === RoleStatus.ADMIN) {
        const admin = await this.adminService.findOneById(decoded.id);
        const storeId = request.query.storeId;
        if (!storeId) {
            throw new UnauthorizedException('Admin must provide storeId');
        }
        const store = await this.storeService.getStoreById(+storeId);
        request.currentUser = {
            type: RoleStatus.ADMIN,
            userId: admin.id,
            context: store 
        };
        return true;
        }

        if (decoded.role === RoleStatus.STORE) {
        const store = await this.storeService.getStoreById(decoded.id);
        store.lastActive = new Date();
        await store.save();
        request.currentUser = {
            type: RoleStatus.STORE,
            userId: store.id,
            context: store
        };
        return true;
        }

        throw new UnauthorizedException('Unauthorized role');
    }
}