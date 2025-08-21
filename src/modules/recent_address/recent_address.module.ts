import { Module } from '@nestjs/common';
import { RecentAddressService } from './recent_address.service';
import { RecentAddressController } from './recent_address.controller';
import { RecentAddressProvider } from './providers/recent_address.provider';
import { CustomerModule } from '../customer/customer.module';

@Module({
  controllers: [RecentAddressController],
  providers: [RecentAddressService,...RecentAddressProvider],
  exports:[RecentAddressService],
  imports:[CustomerModule]
})
export class RecentAddressModule {}
