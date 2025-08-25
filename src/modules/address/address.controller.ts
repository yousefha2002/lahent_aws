import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AddressDto } from './dto/address.dto';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Serilaize(AddressDto)
  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @ApiOperation({ summary: 'Create a new address for the current customer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({status: 201,description: 'Address created successfully',type: AddressDto})
  @Post()
  create(@CurrentUser() user: Customer,@Body() dto: CreateAddressDto,@Query('lang') lang=Language.ar) 
  {
    return this.addressService.create(user.id, dto,lang);
  }

  @Serilaize(AddressDto)
  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @ApiOperation({ summary: 'Update an existing address' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the address to update', example: 1 })
  @ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: 'Address updated successfully', type: AddressDto })
  @Put(':id')
  update(@CurrentUser() user: Customer,@Param('id') addressId: number,@Body() dto: UpdateAddressDto,@Query('lang') lang=Language.ar) 
  {
    return this.addressService.update(user.id,addressId, dto,lang);
  }

  @Serilaize(AddressDto)
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Get all addresses for the current customer' })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'List of addresses', type: [AddressDto] })
  @Get()
  getAll(@CurrentUser() user: Customer) {
    return this.addressService.getAll(user.id);
  }

  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Delete an address by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the address to delete', example: 1 })
  @ApiResponse({status: 200,description: 'Address deleted successfully',schema: { example: { message: 'Deleted successfully' } },})
  @Delete(':id')
  remove(@CurrentUser() user: Customer,@Param('id') addressId: number,@Query('lang') lang=Language.ar) 
  {
    return this.addressService.remove(user.id, addressId,lang);
  }
}
