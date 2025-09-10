import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './services/store.service';
import { StoreController } from './store.controller';
import { StoreProvider } from './providers/store.provider';
import { OwnerModule } from '../owner/owner.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeModule } from '../type/type.module';
import { OpeningHourModule } from '../opening_hour/opening_hour.module';
import { CustomerModule } from '../customer/customer.module';
import { AdminModule } from '../admin/admin.module';
import { SubtypeModule } from '../subtype/subtype.module';
import { StoreAuthService } from './services/storeAuth.service';
import { StoreGeolocationService } from './services/storeGeolocation.service';
import { StoreUtilsService } from './services/storeUtils.service';
import { FaviroteModule } from '../favirote/favirote.module';
import { StoreLanguageProvider } from './providers/storeLangauge.provider';
import { UserTokenModule } from '../user_token/user_token.module';
import { SectorModule } from '../sector/sector.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService,StoreAuthService,StoreGeolocationService,StoreUtilsService, ...StoreProvider,...StoreLanguageProvider],
  imports: [
    OwnerModule,
    CloudinaryModule,
    TypeModule,
    forwardRef(() => SubtypeModule),
    OpeningHourModule,
    CustomerModule,
    AdminModule,
    UserTokenModule,
    forwardRef(()=>FaviroteModule),
    SectorModule,
    DatabaseModule
  ],
  exports: [StoreService,StoreUtilsService],
})
export class StoreModule {}
