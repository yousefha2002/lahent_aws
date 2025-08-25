import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsMobilePhone, IsNotEmpty  } from "class-validator";

export class SendOtpDto {
    @ApiProperty({ example: '970599999999', description: 'Phone number to send OTP' })
    @Transform(({ value }) => value?.replace(/\D/g, '')) 
    @IsNotEmpty()
    @IsMobilePhone()
    phone: string;
}