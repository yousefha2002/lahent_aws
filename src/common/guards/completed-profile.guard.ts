import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CompletedProfileGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const customer = request.currentUser;

        if (!customer || !customer.isCompletedProfile) {
            throw new ForbiddenException('Please complete your profile first');
        }

        return true;
    }
}