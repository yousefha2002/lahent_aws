import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CustomerStatus } from 'src/common/enums/customer_status';
import { RoleStatus } from 'src/common/enums/role_status';

@Injectable()
export class CompletedProfileGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.currentUser;
        const entity = user?.context;

        if (!entity || !entity.isCompletedProfile) {
            throw new ForbiddenException('Please complete your profile first');
        }
        if (user.actor.type === RoleStatus.CUSTOMER) {
            if (entity.status !== CustomerStatus.ACTIVE) {
                throw new ForbiddenException('Your customer account is suspended');
            }
        }
        return true;
    }
}