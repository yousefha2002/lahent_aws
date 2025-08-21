import { Module } from '@nestjs/common';
import { CarModelService } from './car_model.service';
import { CarModelController } from './car_model.controller';
import { CarModelProvider } from './providers/car_model.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [CarModelController],
  providers: [CarModelService,...CarModelProvider],
  imports:[AdminModule],
  exports:[CarModelService]
})
export class CarModelModule {}
