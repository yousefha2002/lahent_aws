import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { ExtraDto } from "src/modules/product_extra/dto/extra-dto";
import { InstructionDto } from "src/modules/product_instruction/dto/instruction-dto";
import { VariantDto } from "src/modules/prouduct_variant/dto/variant-dto";

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
    @ApiProperty({ type: () => [ExtraDto] }) @Expose() @Type(() => ExtraDto) extras: ExtraDto[];
    @ApiProperty({ type: () => [VariantDto] }) @Expose() @Type(() => VariantDto) variants: VariantDto[];
    @ApiProperty({ type: () => [InstructionDto] }) @Expose() @Type(() => InstructionDto) instructions: InstructionDto[];
}