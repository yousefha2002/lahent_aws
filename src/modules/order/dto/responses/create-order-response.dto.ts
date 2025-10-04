import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateOrderResponseDto {
    @ApiProperty({ description: 'ID of the created order', example: 123 })
    @Expose()
    orderId: number;

    @ApiProperty({ description: 'Total price of the order', example: 250.5 })
    @Expose()
    totalPrice: number;

    @ApiProperty({ description: 'Confirmation message', example: 'Order placed successfully' })
    @Expose()
    message: string;
}