import { Transform } from "class-transformer";
import { IsMobilePhone, IsNotEmpty, IsOptional, IsString,  } from "class-validator";

export class SendOtpDto {
    @Transform(({ value }) => value?.replace(/\D/g, '')) 
    @IsNotEmpty()
    @IsMobilePhone()
    phone: string;
}