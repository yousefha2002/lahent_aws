import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { InstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { VariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';
import { SimpleCustomerDto } from 'src/modules/customer/dto/simple-customer.dto';
import { SimpleStoreDto } from 'src/modules/store/dto/simple-store.dto';
import { CustomerCarListDto } from 'src/modules/car/dto/customer-car-list.dto';
import { OrderStatus } from 'src/common/enums/order_status';
import { PickupType } from 'src/common/enums/pickedup_type';

export class OrderItemDto {
    @ApiProperty({ example: 1 }) @Expose() id: number;
    @ApiProperty({ example: 'No onions' }) @Expose() note: string;
    @ApiProperty({ example: 101 }) @Expose() productId: number;
    @ApiProperty({ example: 'Burger' }) @Expose() productName: string;
    @ApiProperty({ example: 10.5 }) @Expose() unitBasePrice: number;
    @ApiProperty({ example: 9.5 }) @Expose() unitFinalPrice: number;
    @ApiProperty({ example: 8 }) @Expose() unitDiscountedPrice: number;
    @ApiProperty({ example: 19 }) @Expose() finalSubtotal: number;
    @ApiProperty({ example: 2 }) @Expose() quantity: number;
    @ApiProperty({ example: 0 }) @Expose() freeQty: number;
    @ApiProperty({ example: ['https://example.com/image.png'] }) @Expose() @Transform(({ obj }) => obj.product?.images?.map(img => img.imageUrl) || []) images: string[];
    @ApiProperty({ type: () => [ExtraDto] }) @Expose() @Type(() => ExtraDto) extras: ExtraDto[];
    @ApiProperty({ type: () => [VariantDto] }) @Expose() @Type(() => VariantDto) variants: VariantDto[];
    @ApiProperty({ type: () => [InstructionDto] }) @Expose() @Type(() => InstructionDto) instructions: InstructionDto[];
}

export class OrderDto {
    @ApiProperty({ example: 1 }) @Expose() id: number;
    @ApiProperty({ example: 1001 }) @Expose() orderNumber: number;
    @ApiProperty({ example: OrderStatus.PENDING_PAYMENT ,enum: OrderStatus}) @Expose() status: OrderStatus;
    @ApiProperty({ example: 'delivery' ,enum:PickupType}) @Expose() pickupType: PickupType;
    @ApiProperty({ example: 30 }) @Expose() estimatedTime: number;
    @ApiProperty({ example: 50 }) @Expose() finalPriceToPay: number;
    @ApiProperty({ example: 60 }) @Expose() subtotalBeforeDiscount: number;
    @ApiProperty({ example: 10 }) @Expose() discountCouponAmount: number;
    @ApiProperty({ example: true }) @Expose() pickupByCustomer: boolean;
    @ApiPropertyOptional({ example: 'John Doe' }) @Expose() pickupPersonName: string | null;
    @ApiPropertyOptional({ example: '596231312' }) @Expose() pickupPersonNumber: string | null;
    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت دفع العميل (قد يكون null)' })
    @Expose()
    paidAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت قبول العرض من قبل العميل أو المتجر (قد يكون null)' })
    @Expose()
    placedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت جدولة الطلب أو العرض (قد يكون null)' })
    @Expose()
    scheduledAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت إلغاء الطلب (قد يكون null)' })
    @Expose()
    canceledAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت وصول العميل أو الطلب (قد يكون null)' })
    @Expose()
    arrivedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت تجهيز الطلب من قبل المتجر (قد يكون null)' })
    @Expose()
    readyAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت استلام العميل للطلب (قد يكون null)' })
    @Expose()
    receivedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت استلام العميل للطلب (قد يكون null)' })
    @Expose()
    preparedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت إنشاء الطلب بواسطة العميل (غير قابل لأن يكون null)' })
    @Expose()
    createdAt: Date;
    
    @ApiPropertyOptional({ type: () => SimpleCustomerDto }) @Expose() @Type(() => SimpleCustomerDto) customer?: SimpleCustomerDto;
    @ApiPropertyOptional({ type: () => SimpleStoreDto }) @Expose() @Type(() => SimpleStoreDto) store?: SimpleStoreDto;
    @ApiPropertyOptional({ type: () => CustomerCarListDto }) @Expose() @Type(() => CustomerCarListDto) car?: CustomerCarListDto;
    @ApiProperty({ example: 10 }) @Expose() pointsEarned: number;
    @ApiProperty({ type: () => [OrderItemDto] }) @Expose() @Type(() => OrderItemDto) orderItems: OrderItemDto[];
}
