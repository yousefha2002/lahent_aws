import { Body,Controller,Delete,Get,Param,Post,Put }from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreatePaymentCardDto } from './dto/create-payment-card.dto';
import { UpdatePaymentCardDto } from './dto/update-payment-card.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaymentCardDto } from './dto/payment-card.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('payment-card')
export class PaymentCardController {
  constructor(private readonly paymentCardService: PaymentCardService) {}

  @Serilaize(PaymentCardDto)
  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  @ApiOperation({ summary: 'Create a new payment card for the current customer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreatePaymentCardDto })
  @ApiResponse({ status: 201, description: 'Payment card created', type: PaymentCardDto })
  @Post()
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreatePaymentCardDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.paymentCardService.create(dto, context.id);
  }

  @Serilaize(PaymentCardDto)
  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  @ApiOperation({ summary: 'Update an existing payment card' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', example: 1, description: 'Payment card ID' })
  @ApiBody({ type: UpdatePaymentCardDto })
  @ApiResponse({ status: 200, description: 'Payment card updated', type: PaymentCardDto })
  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') cardId: number,
    @Body() dto: UpdatePaymentCardDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.paymentCardService.update(cardId, dto, context.id);
  }

  @Serilaize(PaymentCardDto)
  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN],PermissionKey.ViewCustomerSaves)
  @ApiOperation({ summary: 'Get all payment cards of the current customer' })
  @ApiQuery({ name: 'customerId', required: false, example: 1 })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'List of payment cards', type: [PaymentCardDto] })
  @Get()
  getAll(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.paymentCardService.getAll(context.id);
  }

  @Serilaize(PaymentCardDto)
  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN],PermissionKey.ViewCustomerSaves)
  @ApiOperation({ summary: 'Get one payment card by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', example: 1, description: 'Payment card ID' })
  @ApiResponse({ status: 200, description: 'Payment card', type: PaymentCardDto })
  @Get(':id')
  getOne(@CurrentUser() user: CurrentUserType, @Param('id') cardId: number) {
    const {context} = user
    return this.paymentCardService.getOne(cardId, context.id);
  }

  @PermissionGuard([RoleStatus.CUSTOMER])
  @ApiOperation({ summary: 'Delete a payment card by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', example: 1, description: 'Payment card ID' })
  @ApiResponse({ status: 200, description: 'Payment card deleted', schema: { example: { message: 'Card deleted' } } })
  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserType, @Param('id') cardId: number) {
    const {context} = user
    return this.paymentCardService.delete(cardId, context.id);
  }
}