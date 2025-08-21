import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AddressDto } from './dto/address.dto';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Serilaize(AddressDto)
  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @Post()
  create(@CurrentUser() user: Customer,@Body() dto: CreateAddressDto,@Query('lang') lang=Language.en) 
  {
    return this.addressService.create(user.id, dto,lang);
  }

  @Serilaize(AddressDto)
  @UseGuards(CustomerGuard)
  @Get()
  getAll(@CurrentUser() user: Customer) {
    return this.addressService.getAll(user.id);
  }

  @UseGuards(CustomerGuard)
  @Delete(':id')
  remove(@CurrentUser() user: Customer,@Param('id') addressId: number,@Query('lang') lang=Language.en) 
  {
    return this.addressService.remove(user.id, addressId,lang);
  }
}
