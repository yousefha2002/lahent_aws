import { Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';
import { SectorProvider } from './providers/sector.provider';
import { SectorLanguageProvider } from './providers/sector_language.provider';
import { AdminModule } from '../admin/admin.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [SectorController],
  providers: [SectorService,...SectorProvider,...SectorLanguageProvider],
  imports:[AdminModule,DatabaseModule],
  exports:[SectorService]
})
export class SectorModule {}
