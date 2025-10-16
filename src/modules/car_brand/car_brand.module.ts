import { forwardRef, Module } from '@nestjs/common';
import { CarBrandService } from './car_brand.service';
import { CarBrandController } from './car_brand.controller';
import { CarBrandProvider } from './providers/car_brand.provider';
import { UserContextModule } from '../user-context/user-context.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  controllers: [CarBrandController],
  providers: [CarBrandService,...CarBrandProvider],
  imports:[forwardRef(()=>UserContextModule),AuditLogModule],
  exports:[CarBrandService]
})
export class CarBrandModule {}
