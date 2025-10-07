import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StoreStatus } from '../../enums/store_status';

@Injectable()
export class ApprovedStoreGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const currentUser = request.currentUser;
        const store = currentUser?.context;
        if (!store || store.status !== StoreStatus.APPROVED) {
            throw new ForbiddenException('Store is not active');
        }
        return true;
    }
}