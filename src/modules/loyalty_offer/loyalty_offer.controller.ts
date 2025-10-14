import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { LoyaltyOfferService } from './loyalty_offer.service';
import { UpdateLoyaltyOfferDto } from './dto/update-loyalty-offer.dto';
import { CreateLoyaltyOfferDto } from './dto/create-loyalty-offer.dto';
import { BaseloyaltyOfferDto, ExtendedLoyaltyOfferDto, PaginatedLoyaltyOfferDto } from './dto/loyalty-offer.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('loyalty-offer')
export class LoyaltyOfferController {
  constructor(private readonly loyaltyOfferService: LoyaltyOfferService) {}

  @Serilaize(ExtendedLoyaltyOfferDto)
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.CreateLoyaltyOffer)
  @Post()
  @ApiOperation({ summary: 'Create a new loyalty offer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateLoyaltyOfferDto })
  @ApiResponse({ status: 201, description: 'Created loyalty offer', type: ExtendedLoyaltyOfferDto })
  async create(@Body() dto: CreateLoyaltyOfferDto, @I18n() i18n: I18nContext) {
    return this.loyaltyOfferService.create(dto, getLang(i18n));
  }

  @Serilaize(PaginatedLoyaltyOfferDto)
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewLoyaltyOffer)
  @Get('admin')
  @ApiOperation({ summary: 'Get all loyalty offers for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, type: [PaginatedLoyaltyOfferDto] })
  async getAllForAdmin(@Query('page',new ParseIntPipe({ optional: true })) page = 1,@Query('limit',new ParseIntPipe({ optional: true })) limit = 10) {
    return this.loyaltyOfferService.findAllForAdmin(page,limit);
  }

  @Serilaize(BaseloyaltyOfferDto)
  @Get('active')
  @ApiOperation({ summary: 'Get all active loyalty offers for customer' })
  @ApiResponse({ status: 200, description: 'List of active loyalty offers', type: [BaseloyaltyOfferDto] })
  async getActiveForCustomer() {
    return this.loyaltyOfferService.findActiveForCustomer();
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateLoyaltyOffer)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a loyalty offer by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the loyalty offer', example: 1 })
  @ApiBody({ type: UpdateLoyaltyOfferDto })
  @ApiResponse({ status: 200, description: 'Updated loyalty offer', type: ExtendedLoyaltyOfferDto })
  async update(@Param('id') id: number, @Body() dto: UpdateLoyaltyOfferDto, @I18n() i18n: I18nContext) {
    return this.loyaltyOfferService.update(+id, dto, getLang(i18n));
  }

  @Serilaize(ExtendedLoyaltyOfferDto)
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateLoyaltyOffer)
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle the status of a loyalty offer by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', description: 'ID of the loyalty offer', example: 1 })
  @ApiResponse({ status: 200, description: 'Loyalty offer status toggled successfully', type: ExtendedLoyaltyOfferDto })
  async toggleStatus(@Param('id') id: number, @I18n() i18n: I18nContext) {
    return this.loyaltyOfferService.toggleStatus(+id, getLang(i18n));
  }
}