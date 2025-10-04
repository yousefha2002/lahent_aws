import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerCarListDto } from 'src/modules/car/dto/customer-car-list.dto';
import { OrderItemDto } from 'src/modules/order_item/dtos/order-item.dto';
import { SimpleOrderDto } from './simple-order.dto';

export class OrderDto extends SimpleOrderDto {
    @ApiProperty({ example: 60 }) 
    @Expose() subtotalBeforeDiscount: number;

    @ApiProperty({ example: 10 }) 
    @Expose() discountCouponAmount: number;

    @ApiProperty({ example: true }) 
    @Expose() pickupByCustomer: boolean;

    @ApiPropertyOptional({ example: 'John Doe' }) 
    @Expose() pickupPersonName: string | null;

    @ApiPropertyOptional({ example: '596231312' }) 
    @Expose() pickupPersonNumber: string | null;

    @ApiProperty({example:true,description:"هل تم تمديد الطلب من قبل العميل"})
    @Expose()
    hasExtended:boolean
    
    @ApiPropertyOptional({ type: () => CustomerCarListDto }) 
    @Expose() 
    @Type(() => CustomerCarListDto) 
    car?: CustomerCarListDto;

    @ApiProperty({ example: 10 }) 
    @Expose() 
    pointsEarned: number;

    @ApiProperty({ type: () => [OrderItemDto] }) 
    @Expose() @Type(() => OrderItemDto) 
    orderItems: OrderItemDto[];
}