import { IsNotEmpty, IsString } from "class-validator";

export class ChargeWalletDTO {
    @IsString()
    @IsNotEmpty()
    gateway:string
}