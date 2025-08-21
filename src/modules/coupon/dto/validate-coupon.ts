import { IsNotEmpty, IsString } from "class-validator";

export class ValidateCouponDTO {
    @IsNotEmpty()
    @IsString()
    code: string;
}