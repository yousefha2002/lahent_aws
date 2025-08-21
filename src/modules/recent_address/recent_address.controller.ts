import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RecentAddressService } from './recent_address.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { RecentAddressDto } from './dto/recent-address.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Language } from 'src/common/enums/language';

@Controller('recent-address')
export class RecentAddressController {
  constructor(private readonly recentAddressService: RecentAddressService) {}
    @Serilaize(RecentAddressDto)
    @UseGuards(CustomerGuard)
    @Get()
    getAll(@CurrentUser() user: Customer) {
      return this.recentAddressService.getAllRecentAddresses(user.id);
    }
  
    @UseGuards(CustomerGuard)
    @Delete(':id')
    remove(@CurrentUser() user: Customer,@Param('id') addressId: number,@Query('lang') lang=Language.en) 
    {
      return this.recentAddressService.removeRecentAddress(addressId,user.id,lang);
    }
}
