import { Module } from '@nestjs/common';
import { CarTypeService } from './car_type.service';
import { CarTypeController } from './car_type.controller';
import { AdminModule } from '../admin/admin.module';
import { CarTypeProvider } from './providers/car_type.provider';

@Module({
  controllers: [CarTypeController],
  providers: [CarTypeService,...CarTypeProvider],
  imports:[AdminModule],
  exports:[CarTypeService]
})
export class CarTypeModule {}
