import { OrderPlacingService } from './services/order-placing.service';
import { OrderStatusService } from './services/order_status.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { CustomerGuard } from 'src/common/guards/roles/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { createOrderDto } from './dto/requests/create-order.dto';
import { ExtendOrderTimeDto } from './dto/requests/extend-order-time.dto';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { OrderPaymentService } from './services/order-payment.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedOrderListDto } from './dto/responses/store-order-list.dto';
import { filterStatusByStore } from 'src/common/types/filter-status';
import { OrderDto } from './dto/responses/order-full-details.dto';
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateOrderResponseDto } from './dto/responses/create-order-response.dto';
import { PaymentResponseDto } from './dto/responses/payment-order-respone.dto';
import { OrderActionResponseDto } from './dto/responses/order-action-response.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { AcceptOrderDto } from './dto/requests/accept-order.dto';
import { StoreOrderStatsResponseDto } from './dto/responses/order-stats-response.dto';
import { OrderAnalyticsResponseDto } from './dto/responses/order-analytics.dto';
import { StoreFinancialsFilterDto } from '../store/dto/requests/store-financials-filter.dto';
import { PayOrderDTO } from './dto/requests/pay-order-dto';
import { ReorderResponseDto } from './dto/responses/reorder-response.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderPaymentService:OrderPaymentService,
    private readonly orderStatusService:OrderStatusService,
    private readonly orderPlacingService:OrderPlacingService
  ) {}

  @Serilaize(CreateOrderResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  @Post('place')
  @ApiOperation({ summary: 'Place a new order' })
  @ApiSecurity('access-token')
  @ApiBody({ type: createOrderDto })
  @ApiResponse({ status: 201, type: CreateOrderResponseDto })
  placeOrder(@CurrentUser() user:CurrentUserType,@Body() dto:createOrderDto,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderPlacingService.placeOrder(context,dto,lang)
  }

  @Serilaize(PaymentResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Post('pay/:orderId')
  @ApiOperation({ summary: 'Pay for an order' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to pay', example: 1 })
  @ApiResponse({ status: 200, description: 'Payment result', type: PaymentResponseDto })
  payOrder(@CurrentUser() user:CurrentUserType,@Param('orderId',ParseIntPipe) orderId:number,@I18n() i18n: I18nContext,@Body() dto: PayOrderDTO)
  {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderPaymentService.payOrder(orderId,context,dto,lang)
  }

  @Serilaize(OrderAnalyticsResponseDto)
  @PermissionGuard([RoleStatus.ADMIN,RoleStatus.STORE])
  @Get('analytics/byStore')
  @ApiOperation({ summary: 'Get analytics (avg prep time + repeat rate) for a store' })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'Store analytics',
    type: OrderAnalyticsResponseDto,
  })
  async getOrderAvgAnalyticsByStore(
    @CurrentUser() user: CurrentUserType,
    @Query() query: StoreFinancialsFilterDto
  ) {
    const { filter, specificDate } = query;
    const {context} = user
    return this.orderService.getOrderAvgAnalyticsByStore(context.id, filter, specificDate);
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.STORE],ApprovedStoreGuard)
  @Put('reject/:orderId')
  @ApiOperation({ summary: 'Reject an order by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to reject', example: 123 })
  @ApiResponse({ status: 200, description: 'Order rejected successfully', type: OrderActionResponseDto })
  rejectOrder(@CurrentUser() user:CurrentUserType,@Param('orderId') orderId:number,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.rejectOrderByStore(orderId,context.id,lang)
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.STORE],ApprovedStoreGuard)
  @Put('accept/:orderId')
  @ApiOperation({ summary: 'Accept an order by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to accept', example: 123 })
  @ApiResponse({ status: 200, description: 'Order accepted successfully', type: OrderActionResponseDto })
  @ApiBody({ type: AcceptOrderDto })
  acceptOrder(@CurrentUser() user:CurrentUserType,@Param('orderId') orderId:number,@Body() dto:AcceptOrderDto,@I18n() i18n: I18nContext)
  {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.acceptOrderByStore(orderId,context.id,dto,lang)
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Put('extend-decision/:orderId')
  @ApiOperation({ summary: 'Extend the decision timeout for a customer order' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to extend decision time', example: 123 })
  @ApiBody({ type: ExtendOrderTimeDto })
  @ApiResponse({ status: 200, description: 'Decision timeout extended successfully', type: OrderActionResponseDto })
  extendDecisionTimeout(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: ExtendOrderTimeDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.extendCustomerDecisionTimeout(orderId, context.id, body.extraMinutes,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Put('cancel/:orderId')
  @ApiOperation({ summary: 'Cancel an order and request refund' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to cancel', example: 123 })
  @ApiResponse({ status: 200, description: 'Order canceled successfully', type: OrderActionResponseDto })
  cancelOrder(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.refundOrder(orderId, context,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Put('arrived/:orderId')
  @ApiOperation({ summary: 'Mark order as arrived by customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to mark as arrived', example: 123 })
  @ApiResponse({ status: 200, description: 'Order marked as arrived successfully', type: OrderActionResponseDto })
  markArrived(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.markOrderArrived(orderId, context.id,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Put('received/:orderId')
  @ApiOperation({ summary: 'Mark order as received by customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to mark as received', example: 123 })
  @ApiQuery({ name: 'lang', enum: Language, required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'Order marked as received successfully', type: OrderActionResponseDto })
  markReceived(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.markOrderReceived(orderId, context.id,lang);
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.STORE])
  @ApiOperation({ summary: 'Mark order as ready by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order to mark as ready', example: 123 })
  @ApiResponse({ status: 200, description: 'Order marked as ready successfully', type: OrderActionResponseDto })
  @Put('ready/:orderId')
  markReady(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.markOrderReady(orderId, context.id,lang);
  }

  @Serilaize(PaginatedOrderListDto)
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN])
  @Get('byStore')
  @ApiOperation({ summary: 'Get paginated orders for a store' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiQuery({ name: 'status', required: false, description: 'Filter orders by status', enum: ['incoming', 'preparing', 'ready', 'arrived', 'completed', 'cancelled'] })
  @ApiResponse({ status: 200, description: 'Paginated list of orders for store', type: PaginatedOrderListDto })
  getOrdersByStore(@CurrentUser() user:any,@Query('page',) page=1,@Query('limit') limit=10,@Query('status') filterStatus:filterStatusByStore)
  {
    const {context} = user
    return this.orderService.getOrdersByStore(context.id,+page,+limit,filterStatus)
  }

  @Serilaize(PaginatedOrderListDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Get('byCustomer')
  @ApiOperation({ summary: 'Get paginated orders for a customer' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'storeId', required: false, description: 'Filter by store ID', example: 5 })
  @ApiResponse({ status: 200, description: 'Paginated list of orders for customer', type: PaginatedOrderListDto })
  getOrdersByCustomer(@CurrentUser() user:CurrentUserType,@Query('page',) page=1,@Query('limit') limit=10,@Query('storeId') storeId?: number)
  {
    const {context} = user
    return this.orderService.getOrdersForCustomer(context.id,+page,+limit,undefined,storeId)
  }

  @Serilaize(StoreOrderStatsResponseDto)
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN])
  @Get('stats/byStore')
  @ApiOperation({ summary: 'Get order statistics for a store' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'Order statistics grouped by status',
    type:StoreOrderStatsResponseDto
  })
  async getStoreOrderStats(@CurrentUser() user: CurrentUserType, @Query() query: StoreFinancialsFilterDto) {
    const { filter, specificDate } = query;
    const {context} = user
    return this.orderService.getStoreOrderStats(context.id,filter,specificDate);
  }

  @Serilaize(OrderDto)
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN])
  @Get(':orderId/byStore')
  @ApiOperation({ summary: 'Get order details by store' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order', example: 123 })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderDto })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  getOrderByStore(@CurrentUser() user:CurrentUserType,@Param('orderId',) orderId:number)
  {
    const {context} = user
    return this.orderService.getOrderByStore(context.id,orderId)
  }

  @Serilaize(OrderDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Get(':orderId/byCustomer')
  @ApiOperation({ summary: 'Get order details by customer' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order', example: 123 })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderDto })
  getOrderByCustomer(@CurrentUser() user:CurrentUserType,@Param('orderId',) orderId:number)
  {
    const {context} = user
    return this.orderService.getOrderByCustomer(context.id,orderId)
  }

  @Serilaize(OrderActionResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Put('on-the-way/:orderId')
  @ApiOperation({ summary: 'Customer marks that they are on the way' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the order', example: 123 })
  @ApiResponse({ status: 200, description: 'Store notified that customer is on the way', type: OrderActionResponseDto })
  markOnTheWay(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderStatusService.markCustomerOnTheWay(orderId, context.id, lang);
  }

  
  @Serilaize(ReorderResponseDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Post('reorder/:orderId')
  @ApiOperation({ summary: 'Reorder a previous order' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'orderId', description: 'ID of the previous order', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Products added to cart successfully',
    type: ReorderResponseDto,
  })
  async reorder(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', ParseIntPipe) orderId: number,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.orderPlacingService.reorder(orderId, context, lang);
  }
}