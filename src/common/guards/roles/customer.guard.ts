import { CustomerService } from '../../../modules/customer/customer.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus } from '../../enums/role_status';

@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private customerService:CustomerService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Customer must be logged in');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: 'token',
      });

      if (decoded.role !== RoleStatus.CUSTOMER) {
        throw new UnauthorizedException('Unauthorized role');
      }
      const customer = await this.customerService.findById(decoded.id);
      customer.lastActive = new Date();
      await customer.save();
      request.currentUser = {
        userId: customer.id,
        type: RoleStatus.CUSTOMER,
        context:customer
      };
      return !!decoded.id;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
