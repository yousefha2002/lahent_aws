import { Module } from '@nestjs/common';
import { CarBrandService } from './car_brand.service';
import { CarBrandController } from './car_brand.controller';
import { CarBrandProvider } from './providers/car_brand.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [CarBrandController],
  providers: [CarBrandService,...CarBrandProvider],
  imports:[AdminModule],
  exports:[CarBrandService]
})
export class CarBrandModule {}
