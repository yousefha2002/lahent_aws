import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDate, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GatewayType } from 'src/common/enums/gatewat_type';
import { PaymentMethod } from 'src/common/enums/payment_method';
import { PickupType } from 'src/common/enums/pickedup_type';
import { CreateCarDto } from 'src/modules/car/dto/create_car.dto';

export class createOrderDto {
    @ApiProperty({ description: 'ID of the store', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    storeId: number;

    @ApiPropertyOptional({ description: 'Coupon code for discount', example: 'SAVE10' })
    @IsString()
    @IsOptional()
    couponCode?: string;

    @ApiProperty({ description: 'Type of pickup', enum: PickupType ,example:"IN_STORE"})
    @IsString()
    @IsNotEmpty()
    pickupType: PickupType;

    @ApiPropertyOptional({ description: 'Scheduled date for pickup',example:"2020-3-2 01:20", type: String, format: 'date-time' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    scheduledAt?: Date;

    @ApiPropertyOptional({ description: 'Car ID if using a saved car', example: 5 })
    @IsNumber()
    @IsOptional()
    carId?: number;

    @ApiPropertyOptional({ description: 'Name of the person picking up', example: 'John Doe' })
    @IsString()
    @IsOptional()
    pickupPersonName?: string;

    @ApiPropertyOptional({ description: 'Phone number of the pickup person', example: '+1234567890' })
    @IsString()
    @IsOptional()
    pickupPersonNumber?: string;

    @ApiProperty({ description: 'Whether the pickup is done by the customer', example: true })
    @IsBoolean()
    @IsNotEmpty()
    pickupByCustomer: boolean;

    @ApiPropertyOptional({ 
    description: 'Points used for this order', 
    example: 500, 
    minimum: 500 
    })
    @IsNumber()
    @IsOptional()
    @Min(500, { message: 'Points used must be at least 500' })
    pointsUsed?: number;

    @ApiPropertyOptional({ description: 'Payment gateway type', enum: GatewayType,example:GatewayType.edfapay })
    @IsEnum(GatewayType)
    @IsOptional()
    gatewayType?: GatewayType;

    @ApiProperty({ description: 'Payment method', enum: PaymentMethod ,example:PaymentMethod.GATEWAY})
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @ApiPropertyOptional({ description: 'New car details if adding a new car', type: CreateCarDto })
    @IsOptional()
    newCar?: CreateCarDto;
}
