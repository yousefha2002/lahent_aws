import { forwardRef, Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { CarProvider } from './providers/car.provider';
import { CarBrandModule } from '../car_brand/car_brand.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [CarController],
  providers: [CarService, ...CarProvider],
  imports: [CarBrandModule, forwardRef(()=>UserContextModule)],
  exports:[CarService]
})
export class CarModule {}
