import { OrderItemInstructionDto } from './../../order_item_instruction/dtos/order-item-instruction.dto';
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { OrderItemExtraDto } from "src/modules/order_item_extra/dtos/order-item-extra.dto";
import { OrderItemVariantDto } from 'src/modules/order_item_variant/dtos/order-item-variant.dto';

export class OrderItemDto {
    @ApiProperty({ example: 1 }) @Expose() id: number;
    @ApiProperty({ example: 'No onions' }) @Expose() note: string;
    @ApiProperty({ example: 'Burger' }) @Expose() productName: string;
    @ApiProperty({ example: 10.5 }) @Expose() unitBasePrice: number;
    @ApiProperty({ example: 9.5 }) @Expose() unitFinalPrice: number;
    @ApiProperty({ example: 8 }) @Expose() unitDiscountedPrice: number;
    @ApiProperty({ example: 19 }) @Expose() finalSubtotal: number;
    @ApiProperty({ example: 2 }) @Expose() quantity: number;
    @ApiProperty({ example: 0 }) @Expose() freeQty: number;
    @ApiProperty({ example: ['https://example.com/image.png'] }) @Expose() @Transform(({ obj }) => obj.product?.images?.map(img => img.imageUrl) || []) images: string[];
    @ApiProperty({ type: () => [OrderItemExtraDto] }) @Expose() @Type(() => OrderItemExtraDto) extras: OrderItemExtraDto[];
    @ApiProperty({ type: () => [OrderItemVariantDto] }) @Expose() @Type(() => OrderItemVariantDto) variants: OrderItemVariantDto[];
    @ApiProperty({ type: () => [OrderItemInstructionDto] }) @Expose() @Type(() => OrderItemInstructionDto) instructions: OrderItemInstructionDto[];
}