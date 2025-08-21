import { Module } from '@nestjs/common';
import { OpeningHourService } from './opening_hour.service';
import { OpeningHourController } from './opening_hour.controller';
import { OpeningHourProvider } from './providers/opening_hour.provider';

@Module({
  controllers: [OpeningHourController],
  providers: [OpeningHourService, ...OpeningHourProvider],
  exports: [OpeningHourService],
})
export class OpeningHourModule {}
