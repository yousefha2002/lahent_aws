import { OrderStatusService } from './services/order_status.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
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

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderPaymentService:OrderPaymentService,
    private readonly orderStatusService:OrderStatusService
  ) {}

  @UseGuards(CustomerGuard,CompletedProfileGuard)
  @Post('place')
  placeOrder(@CurrentUser() user:Customer,@Body() dto:createOrderDto,@Query('lang') lang=Language.en)
  {
    return this.orderService.placeOrder(user,dto,lang)
  }

  @UseGuards(CustomerGuard)
  @Post('pay/:orderId')
  payOrder(@CurrentUser() user:Customer,@Param('orderId',ParseIntPipe) orderId:number,@Query('lang') lang=Language.en)
  {
    return this.orderPaymentService.payOrder(orderId,user,lang)
  }

  @Post('payment/callback/:sessionId')
  async paymentCallback(@Param('sessionId', ParseIntPipe) sessionId: number,@Query('lang') lang=Language.en) {
    return this.orderPaymentService.confirmOrderPayment(sessionId,lang);
  }

  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Put('reject/:orderId')
  rejectOrder(@CurrentUser() store:Store,@Param('orderId') orderId:number,@Query('lang') lang=Language.en)
  {
    return this.orderStatusService.rejectOrderByStore(orderId,store.id,lang)
  }

  @UseGuards(StoreOrOwnerGuard,ApprovedStoreGuard)
  @Put('accept/:orderId')
  acceptOrder(@CurrentUser() store:Store,@Param('orderId') orderId:number,@Query('lang') lang=Language.en)
  {
    return this.orderStatusService.acceptOrderByStore(orderId,store.id,lang)
  }

  @UseGuards(CustomerGuard)
  @Put('extend-decision/:orderId')
  extendDecisionTimeout(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: ExtendOrderTimeDto,
    @Query('lang') lang=Language.en
  ) {
    return this.orderStatusService.extendCustomerDecisionTimeout(orderId, user.id, body.extraMinutes,lang);
  }

  @UseGuards(CustomerGuard)
  @Put('cancel/:orderId')
  cancelOrder(
    @CurrentUser() user: Customer,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('lang') lang=Language.en
  ) {
    return this.orderStatusService.refundOrder(orderId, user,lang);
  }

    @UseGuards(CustomerGuard)
    @Put('arrived/:orderId')
    markArrived(
      @CurrentUser() user: Customer,
      @Param('orderId', ParseIntPipe) orderId: number,
      @Query('lang') lang=Language.en
    ) {
      return this.orderStatusService.markOrderArrived(orderId, user.id,lang);
    }

    @UseGuards(CustomerGuard)
    @Put('received/:orderId')
    markReceived(
      @CurrentUser() user: Customer,
      @Param('orderId', ParseIntPipe) orderId: number,
      @Query('lang') lang=Language.en
    ) {
      return this.orderStatusService.markOrderReceived(orderId, user.id,lang);
    }

    @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
    @Put('ready/:orderId')
    markReady(
      @CurrentUser() store: Store,
      @Param('orderId', ParseIntPipe) orderId: number,
      @Query('lang') lang=Language.en
    ) {
      return this.orderStatusService.markOrderReady(orderId, store.id,lang);
    }

    @Serilaize(PaginatedOrderListDto)
    @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
    @Get('byStore')
    getOrdersByStore(@CurrentUser() store:Store,@Query('page',) page=1,@Query('limit') limit=10,@Query('status') filterStatus:filterStatusByStore)
    {
      return this.orderService.getOrdersByStore(store.id,+page,+limit,filterStatus)
    }

    @Serilaize(PaginatedOrderListDto)
    @UseGuards(CustomerGuard)
    @Get('byCustomer')
    getOrdersByCustomer(@CurrentUser() customer:Customer,@Query('page',) page=1,@Query('limit') limit=10)
    {
      return this.orderService.getOrdersForCustomer(customer.id,+page,+limit)
    }

    @Serilaize(OrderDto)
    @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
    @Get(':orderId/byStore')
    getOrderByStore(@CurrentUser() store:Store,@Param('orderId',) orderId:number)
    {
      return this.orderService.getOrderByStore(store.id,orderId)
    }

    @Serilaize(OrderDto)
    @UseGuards(CustomerGuard)
    @Get(':orderId/byCustomer')
    getOrderByCustomer(@CurrentUser() customer:Customer,@Param('orderId',) orderId:number)
    {
      return this.orderService.getOrderByCustomer(customer.id,orderId)
    }
}