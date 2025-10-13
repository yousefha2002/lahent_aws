import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './services/store.service';
import { StoreController } from './store.controller';
import { StoreProvider } from './providers/store.provider';
import { TypeModule } from '../type/type.module';
import { OpeningHourModule } from '../opening_hour/opening_hour.module';
import { SubtypeModule } from '../subtype/subtype.module';
import { StoreAuthService } from './services/storeAuth.service';
import { StoreGeolocationService } from './services/storeGeolocation.service';
import { StoreUtilsService } from './services/storeUtils.service';
import { FaviroteModule } from '../favirote/favirote.module';
import { StoreLanguageProvider } from './providers/storeLangauge.provider';
import { UserTokenModule } from '../user_token/user_token.module';
import { SectorModule } from '../sector/sector.module';
import { DatabaseModule } from 'src/database/database.module';
import { StoreCommissionModule } from '../store_commission/store_commission.module';
import { FcmTokenModule } from '../fcm_token/fcm_token.module';
import { SmsModule } from '../sms/sms.module';
import { UserContextModule } from '../user-context/user-context.module';
import { OrderModule } from '../order/order.module';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService,StoreAuthService,StoreGeolocationService,StoreUtilsService, ...StoreProvider,...StoreLanguageProvider],
  imports: [
    S3Module,
    TypeModule,
    forwardRef(() => SubtypeModule),
    OpeningHourModule,
    forwardRef(()=>UserContextModule),
    UserTokenModule,
    forwardRef(()=>FaviroteModule),
    SectorModule,
    DatabaseModule,
    StoreCommissionModule,
    FcmTokenModule,
    SmsModule,
    forwardRef(()=>OrderModule)
  ],
  exports: [StoreService,StoreUtilsService],
})
export class StoreModule {}
