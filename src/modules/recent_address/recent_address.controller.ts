import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { RecentAddressService } from './recent_address.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { RecentAddressDto } from './dto/recent-address.dto';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Language } from 'src/common/enums/language';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('recent-address')
export class RecentAddressController {
  constructor(private readonly recentAddressService: RecentAddressService) {}
    @Serilaize(RecentAddressDto)
    @UseGuards(CustomerGuard)
    @ApiOperation({ summary: 'Get all recent addresses for the current customer' })
    @ApiSecurity('access-token')
    @ApiResponse({ status: 200, description: 'List of recent addresses', type: [RecentAddressDto] })
    @Get()
    getAll(@CurrentUser() user: Customer) {
      return this.recentAddressService.getAllRecentAddresses(user.id);
    }
  
    @UseGuards(CustomerGuard)
    @ApiOperation({ summary: 'Delete a recent address by ID' })
    @ApiSecurity('access-token')
    @ApiParam({ name: 'id', description: 'ID of the recent address to delete', example: 1 })
    @ApiResponse({status: 200,description: 'Recent address deleted successfully',schema: { example: { message: 'Deleted successfully' } },})
    @Delete(':id')
    remove(@CurrentUser() user: Customer,@Param('id') addressId: number,@Req() req) 
    {
      return this.recentAddressService.removeRecentAddress(addressId,user.id,req.lang);
    }
}
