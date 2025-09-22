import { Body,Controller,Delete,Get,Param,Post,Put,UseGuards }from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { CreatePaymentCardDto } from './dto/create-payment-card.dto';
import { UpdatePaymentCardDto } from './dto/update-payment-card.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaymentCardDto } from './dto/payment-card.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('payment-card')
export class PaymentCardController {
  constructor(private readonly paymentCardService: PaymentCardService) {}

  @Serilaize(PaymentCardDto)
  @UseGuards(CustomerGuard, CompletedProfileGuard)
  @ApiOperation({ summary: 'Create a new payment card for the current customer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreatePaymentCardDto })
  @ApiResponse({ status: 201, description: 'Payment card created', type: PaymentCardDto })
  @Post()
  create(
    @CurrentUser() user: Customer,
    @Body() dto: CreatePaymentCardDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.paymentCardService.create(dto, user.id);
  }

  @Serilaize(PaymentCardDto)
  @UseGuards(CustomerGuard, CompletedProfileGuard)
  @ApiOperation({ summary: 'Update an existing payment card' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', example: 1, description: 'Payment card ID' })
  @ApiBody({ type: UpdatePaymentCardDto })
  @ApiResponse({ status: 200, description: 'Payment card updated', type: PaymentCardDto })
  @Put(':id')
  update(
    @CurrentUser() user: Customer,
    @Param('id') cardId: number,
    @Body() dto: UpdatePaymentCardDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.paymentCardService.update(cardId, dto, user.id);
  }

  @Serilaize(PaymentCardDto)
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Get all payment cards of the current customer' })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'List of payment cards', type: [PaymentCardDto] })
  @Get()
  getAll(@CurrentUser() user: Customer) {
    return this.paymentCardService.getAll(user.id);
  }

  @Serilaize(PaymentCardDto)
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Get one payment card by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', example: 1, description: 'Payment card ID' })
  @ApiResponse({ status: 200, description: 'Payment card', type: PaymentCardDto })
  @Get(':id')
  getOne(@CurrentUser() user: Customer, @Param('id') cardId: number) {
    return this.paymentCardService.getOne(cardId, user.id);
  }

  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Delete a payment card by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', example: 1, description: 'Payment card ID' })
  @ApiResponse({ status: 200, description: 'Payment card deleted', schema: { example: { message: 'Card deleted' } } })
  @Delete(':id')
  remove(@CurrentUser() user: Customer, @Param('id') cardId: number) {
    return this.paymentCardService.delete(cardId, user.id);
  }
}