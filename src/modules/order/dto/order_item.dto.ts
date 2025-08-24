import { Expose, Transform, Type } from "class-transformer";
import { getOrderDate } from "src/common/utils/getOrderDate";
import { ExtraDto } from "src/modules/product_extra/dto/extra-dto";
import { InstructionDto } from "src/modules/product_instruction/dto/instruction-dto";
import { VariantDto } from "src/modules/prouduct_variant/dto/variant-dto";
import { SimpleCustomerDto } from "src/modules/customer/dto/simple-customer.dto";
import { SimpleStoreDto } from "src/modules/store/dto/simple-store.dto";
import { CustomerCarListDto } from "src/modules/car/dto/customer-car-list.dto";

class OrderItemDto {
    @Expose() id: number;
    @Expose() note: string;
    @Expose() productId: number;
    @Expose() productName: string;
    @Expose() unitBasePrice: number;
    @Expose() unitFinalPrice: number;
    @Expose() unitDiscountedPrice: number;
    @Expose() finalSubtotal:number
    @Expose() quantity: number;
    @Expose() freeQty: number;
    @Expose()
    @Transform(({ obj }) => obj.product?.images?.map(img => img.imageUrl) || [])
    images: string[];

    @Expose()
    @Type(() => ExtraDto)
    extras: ExtraDto[];

    @Expose()
    @Type(() => VariantDto)
    variants: VariantDto[];

    @Expose()
    @Type(() => InstructionDto)
    instructions: InstructionDto[];
}

export class OrderDto {
    @Expose() id: number;
    @Expose() orderNumber: number;
    @Expose() status: string;
    @Expose() pickupType: string;
    @Expose() estimatedTime: number;
    @Expose() finalPriceToPay: number;
    @Expose() subtotalBeforeDiscount: number;
    @Expose() discountCouponAmount: number;
    @Expose() pickupByCustomer: boolean;
    @Expose() pickupPersonName: string | null;
    @Expose() pickupPersonNumber: string | null;

    @Expose()
    @Transform(({ obj }) => getOrderDate(obj))
    orderDate: Date;

    // الحقلين: أحدهما سيكون موجود حسب نوع الطلب
    @Expose()
    @Type(() => SimpleCustomerDto)
    customer?: SimpleCustomerDto;

    @Expose()
    @Type(() => SimpleStoreDto)
    store?: SimpleStoreDto;

    @Expose()
    @Type(() => CustomerCarListDto)
    car?: CustomerCarListDto;

    @Expose()
    pointsEarned:number

    @Expose()
    @Type(() => OrderItemDto)
    orderItems: OrderItemDto[];
}