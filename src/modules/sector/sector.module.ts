import { forwardRef, Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';
import { SectorProvider } from './providers/sector.provider';
import { SectorLanguageProvider } from './providers/sector_language.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [SectorController],
  providers: [SectorService,...SectorProvider,...SectorLanguageProvider],
  imports:[forwardRef(()=>UserContextModule),DatabaseModule],
  exports:[SectorService]
})
export class SectorModule {}
