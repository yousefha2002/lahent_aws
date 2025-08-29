import { Type } from "class-transformer";
import {IsNotEmpty, IsNumber, IsOptional, IsString,IsDate, IsBoolean, IsEnum ,Min} from "class-validator";
import { GatewayType } from "src/common/enums/gatewat_type";
import { PaymentMethod } from "src/common/enums/payment_method";
import { PickupType } from "src/common/enums/pickedup_type";
import { CreateCarDto } from "src/modules/car/dto/create_car.dto";

export class createOrderDto {
    @IsNumber()
    @IsNotEmpty()
    storeId:number

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    couponCode:string

    @IsString()
    @IsNotEmpty()
    pickupType: PickupType

    @IsNotEmpty()
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    scheduledAt: Date;

    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    carId:number

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    pickupPersonName:string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    pickupPersonNumber:string

    @IsBoolean()
    @IsNotEmpty()
    pickupByCustomer:boolean

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @Min(0)
    pointsUsed:number

    @IsEnum(GatewayType)
    @IsOptional()
    gatewayType?: GatewayType;

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @IsOptional()
    newCar?: CreateCarDto;
}