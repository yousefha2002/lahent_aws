import { IsEnum, IsNotEmpty } from "class-validator";
import { GatewayType } from "src/common/enums/gatewat_type";

export class ChargeWalletDTO {
    @IsEnum(GatewayType, { message: 'gateway must be a valid GatewayType' })
    @IsNotEmpty()
    gateway:GatewayType
}