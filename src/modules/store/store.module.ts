import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './services/store.service';
import { StoreController } from './store.controller';
import { StoreProvider } from './providers/store.provider';
import { OwnerModule } from '../owner/owner.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeModule } from '../type/type.module';
import { OpeningHourModule } from '../opening_hour/opening_hour.module';
import { AddressModule } from '../address/address.module';
import { CustomerModule } from '../customer/customer.module';
import { RecentAddressModule } from '../recent_address/recent_address.module';
import { AdminModule } from '../admin/admin.module';
import { SubtypeModule } from '../subtype/subtype.module';
import { StoreAuthService } from './services/storeAuth.service';
import { StoreGeolocationService } from './services/storeGeolocation.service';
import { StoreUtilsService } from './services/storeUtils.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService,StoreAuthService,StoreGeolocationService,StoreUtilsService, ...StoreProvider],
  imports: [
    OwnerModule,
    CloudinaryModule,
    forwardRef(() => TypeModule),
    forwardRef(() => SubtypeModule),
    OpeningHourModule,
    AddressModule,
    CustomerModule,
    RecentAddressModule,
    AdminModule,
  ],
  exports: [StoreService,StoreUtilsService],
})
export class StoreModule {}
