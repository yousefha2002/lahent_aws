import { OrderStatusService } from './services/order_status.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { createOrderDto } from './dto/create-order.dto';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from '../store/entities/store.entity';
import { ExtendOrderTimeDto } from './dto/extend-order-time.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { OrderPaymentService } from './services/order-payment.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedOrderListDto } from './dto/store-order-list.dto';
import { filterStatusByStore } from 'src/common/types/filter-status';
import { OrderDto } from './dto/order_item.dto';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
import { PaymentResponseDto } from './dto/payment-order-respone.dto';
import { OrderActionResponseDto } from './dto/order-action-response.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { AcceptOrderDto } from './dto/accept-order.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderPaymentService:OrderPaymentService,
    private readonly orderStatusService:OrderStatusService,
  ) {}

  @Serilaize(CreateOrderResponseDto)
  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @Post('place')
  @ApiOperation({ summary: 'Place a new order' })
  @ApiSecurity('access-token')
  @ApiBody({ type: createOrderDto })
  @ApiResponse({ status: 201, type: CreateOrderResponseDto })
  placeOrder(@CurrentUser() user:Customer,@Body() dto:createOrderDto,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    return this.orderService.placeOrder(user,dto,lang)
  }

  @Serilaize(PaymentResponseDto)
  @UseGuards(CustomerGuard)
  @Post('pay/:orderId')
  @ApiOperation({ summary: 'Pay for an order' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to pay', example: 1 })
  @ApiResponse({ status: 200, description: 'Payment result', type: PaymentResponseDto })
  payOrder(@CurrentUser() user:Customer,@Param('orderId',ParseIntPipe) orderId:number,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    return this.orderPaymentService.payOrder(orderId,user,lang)
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Put('reject/:orderId')
  @ApiOperation({ summary: 'Reject an order by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to reject', example: 123 })
  @ApiResponse({ status: 200, description: 'Order rejected successfully', type: OrderActionResponseDto })
  rejectOrder(@CurrentUser() store:Store,@Param('orderId') orderId:number,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    return this.orderStatusService.rejectOrderByStore(orderId,store.id,lang)
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Put('accept/:orderId')
  @ApiOperation({ summary: 'Accept an order by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to accept', example: 123 })
  @ApiResponse({ status: 200, description: 'Order accepted successfully', type: OrderActionResponseDto })
  @ApiBody({ type: AcceptOrderDto })
  acceptOrder(@CurrentUser() store:Store,@Param('orderId') orderId:number,@Body() dto:AcceptOrderDto,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    return this.orderStatusService.acceptOrderByStore(orderId,store.id,dto,lang)
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(CustomerGuard)
  @Put('extend-decision/:orderId')
  @ApiOperation({ summary: 'Extend the decision timeout for a customer order' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to extend decision time', example: 123 })
  @ApiBody({ type: ExtendOrderTimeDto })
  @ApiResponse({ status: 200, description: 'Decision timeout extended successfully', type: OrderActionResponseDto })
  extendDecisionTimeout(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: ExtendOrderTimeDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.orderStatusService.extendCustomerDecisionTimeout(orderId, user.id, body.extraMinutes,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(CustomerGuard)
  @Put('cancel/:orderId')
  @ApiOperation({ summary: 'Cancel an order and request refund' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to cancel', example: 123 })
  @ApiResponse({ status: 200, description: 'Order canceled successfully', type: OrderActionResponseDto })
  cancelOrder(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.orderStatusService.refundOrder(orderId, user,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(CustomerGuard)
  @Put('arrived/:orderId')
  @ApiOperation({ summary: 'Mark order as arrived by customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to mark as arrived', example: 123 })
  @ApiResponse({ status: 200, description: 'Order marked as arrived successfully', type: OrderActionResponseDto })
  markArrived(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.orderStatusService.markOrderArrived(orderId, user.id,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(CustomerGuard)
  @Put('received/:orderId')
  @ApiOperation({ summary: 'Mark order as received by customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to mark as received', example: 123 })
  @ApiQuery({ name: 'lang', enum: Language, required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'Order marked as received successfully', type: OrderActionResponseDto })
  markReceived(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.orderStatusService.markOrderReceived(orderId, user.id,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @ApiOperation({ summary: 'Mark order as ready by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to mark as ready', example: 123 })
  @ApiResponse({ status: 200, description: 'Order marked as ready successfully', type: OrderActionResponseDto })
  @Put('ready/:orderId')
  markReady(
    @CurrentUser() store: Store,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.orderStatusService.markOrderReady(orderId, store.id,lang);
  }

  @Serilaize(PaginatedOrderListDto)
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Get('byStore')
  @ApiOperation({ summary: 'Get paginated orders for a store' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: 'Filter orders by status', enum: ['incoming', 'preparing', 'ready', 'arrived', 'completed', 'cancelled'] })
  @ApiResponse({ status: 200, description: 'Paginated list of orders for store', type: PaginatedOrderListDto })
  getOrdersByStore(@CurrentUser() store:Store,@Query('page',) page=1,@Query('limit') limit=10,@Query('status') filterStatus:filterStatusByStore)
  {
    return this.orderService.getOrdersByStore(store.id,+page,+limit,filterStatus)
  }

  @Serilaize(PaginatedOrderListDto)
  @UseGuards(CustomerGuard)
  @Get('byCustomer')
  @ApiOperation({ summary: 'Get paginated orders for a customer' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'storeId', required: false, description: 'Filter by store ID', example: 5 })
  @ApiResponse({ status: 200, description: 'Paginated list of orders for customer', type: PaginatedOrderListDto })
  getOrdersByCustomer(@CurrentUser() customer:Customer,@Query('page',) page=1,@Query('limit') limit=10,@Query('storeId') storeId?: number)
  {
    return this.orderService.getOrdersForCustomer(customer.id,+page,+limit,undefined,storeId)
  }

  @Serilaize(OrderDto)
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Get(':orderId/byStore')
  @ApiOperation({ summary: 'Get order details by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order', example: 123 })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderDto })
  getOrderByStore(@CurrentUser() store:Store,@Param('orderId',) orderId:number)
  {
    return this.orderService.getOrderByStore(store.id,orderId)
  }

  @Serilaize(OrderDto)
  @UseGuards(CustomerGuard)
  @Get(':orderId/byCustomer')
  @ApiOperation({ summary: 'Get order details by customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order', example: 123 })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderDto })
  getOrderByCustomer(@CurrentUser() customer:Customer,@Param('orderId',) orderId:number)
  {
    return this.orderService.getOrderByCustomer(customer.id,orderId)
  }

  @Serilaize(OrderActionResponseDto)
  @UseGuards(CustomerGuard)
  @Put('on-the-way/:orderId')
  @ApiOperation({ summary: 'Customer marks that they are on the way' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order', example: 123 })
  @ApiResponse({ status: 200, description: 'Store notified that customer is on the way', type: OrderActionResponseDto })
  markOnTheWay(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.orderStatusService.markCustomerOnTheWay(orderId, user.id, lang);
  }
}