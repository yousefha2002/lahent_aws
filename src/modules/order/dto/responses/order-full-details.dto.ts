import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerCarListDto } from 'src/modules/car/dto/customer-car-list.dto';
import { OrderItemDto } from 'src/modules/order_item/dtos/order-item.dto';
import { SimpleOrderDto } from './simple-order.dto';

export class OrderDto extends SimpleOrderDto {
    @ApiProperty({ example: 10 }) 
    @Expose() 
    couponDiscountAmount: number;

    @ApiProperty({ example: 100 }) 
    @Expose() 
    totalOriginalPrice: number;

    @ApiProperty({ example: 20 }) 
    @Expose() 
    offersDiscount: number;

    @ApiProperty({ example: true }) 
    @Expose() 
    pickupByCustomer: boolean;

    @ApiPropertyOptional({ example: 'John Doe' }) 
    @Expose() 
    pickupPersonName: string | null;

    @ApiPropertyOptional({ example: '596231312' }) 
    @Expose() 
    pickupPersonNumber: string | null;

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

    @ApiProperty({ example: "1234567891011123" }) 
    @Expose() 
    carNumber: string;

    @ApiProperty({ type: () => [OrderItemDto] }) 
    @Expose() @Type(() => OrderItemDto) 
    orderItems: OrderItemDto[];
}