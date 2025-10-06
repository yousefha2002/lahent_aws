import { AdminService } from './../../modules/admin/admin.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from '../enums/role_status';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    console.log(token)

    if (!token) {
      throw new UnauthorizedException('Admin must be logged in');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: 'token',
      });

      if (decoded.role !== RoleStatus.ADMIN) {
        throw new UnauthorizedException('Unauthorized role');
      }

      const admin = await this.adminService.findOneById(decoded.id);
      request.currentUser = admin;
      return !!decoded.id;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
