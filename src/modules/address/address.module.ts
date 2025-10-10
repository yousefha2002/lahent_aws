import { forwardRef, Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressProvider } from './providers/address.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [AddressController],
  providers: [AddressService,...AddressProvider],
  imports:[forwardRef(()=>UserContextModule)],
  exports:[AddressService]
})
export class AddressModule {}
