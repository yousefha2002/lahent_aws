import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressProvider } from './providers/address.provider';
import { CustomerModule } from '../customer/customer.module';

@Module({
  controllers: [AddressController],
  providers: [AddressService,...AddressProvider],
  imports:[CustomerModule],
  exports:[AddressService]
})
export class AddressModule {}
