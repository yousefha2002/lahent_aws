import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { LoyaltyOfferService } from './loyalty_offer.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UpdateLoyaltyOfferDto } from './dto/update-loyalty-offer.dto';
import { CreateLoyaltyOfferDto } from './dto/create-loyalty-offer.dto';
import { BaseloyaltyOfferDto, ExtendedLoyaltyOfferDto } from './dto/loyalty-offer.dt';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('loyalty-offer')
export class LoyaltyOfferController {
  constructor(private readonly loyaltyOfferService: LoyaltyOfferService) {}

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new loyalty offer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateLoyaltyOfferDto })
  @ApiResponse({ status: 201, description: 'Created loyalty offer', type: ExtendedLoyaltyOfferDto })
  async create(@Body() dto: CreateLoyaltyOfferDto,@Req() req) {
    return this.loyaltyOfferService.create(dto,req.lang);
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Get all loyalty offers for admin' })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'List of all loyalty offers', type: [ExtendedLoyaltyOfferDto] })
  async getAllForAdmin() {
    return this.loyaltyOfferService.findAllForAdmin();
  }

  @Serilaize(BaseloyaltyOfferDto)
  @Get('active')
  @ApiOperation({ summary: 'Get all active loyalty offers for customer' })
  @ApiResponse({ status: 200, description: 'List of active loyalty offers', type: [BaseloyaltyOfferDto] })
  async getActiveForCustomer() {
    return this.loyaltyOfferService.findActiveForCustomer();
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a loyalty offer by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the loyalty offer', example: 1 })
  @ApiBody({ type: UpdateLoyaltyOfferDto })
  @ApiResponse({ status: 200, description: 'Updated loyalty offer', type: ExtendedLoyaltyOfferDto })
  async update(@Param('id') id: number, @Body() dto: UpdateLoyaltyOfferDto,@Req() req) {
    return this.loyaltyOfferService.update(+id, dto,req.lang);
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @UseGuards(AdminGuard)
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle the status of a loyalty offer by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the loyalty offer', example: 1 })
  @ApiResponse({ status: 200, description: 'Loyalty offer status toggled successfully', type: ExtendedLoyaltyOfferDto })
  async toggleStatus(@Param('id') id: number,@Req() req) {
    return this.loyaltyOfferService.toggleStatus(+id,req.lang);
  }
}