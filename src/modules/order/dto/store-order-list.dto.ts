import { Expose, Transform, Type } from "class-transformer";
import { getOrderDate } from "src/common/utils/getOrderDate";
import { SimpleCustomerDto } from "src/modules/customer/dto/simple-customer.dto";
import { SimpleStoreDto } from "src/modules/store/dto/simple-store.dto";

export class OrderListDto {
    @Expose()
    id:number

    @Expose()
    status:string

    @Expose()
    pickupType: string;

    @Expose()
    estimatedTime: number;

    @Expose()
    productCount: number;

    @Expose()
    orderNumber:number

    @Expose()
    @Type(() => SimpleCustomerDto)
    customer?: SimpleCustomerDto;

    @Expose()
    @Transform(({ obj }) => getOrderDate(obj))
    orderDate: Date;

    @Expose()
    createdAt:string

    @Expose()
    finalPriceToPay:number
    
    @Expose()
    @Type(() => SimpleStoreDto)
    store?: SimpleStoreDto;
}

export class PaginatedOrderListDto {
    @Expose()
    totalPages:number;

    @Expose()
    totalItems:number
    
    @Expose()
    @Type(() => OrderListDto)
    orders: OrderListDto[];
}