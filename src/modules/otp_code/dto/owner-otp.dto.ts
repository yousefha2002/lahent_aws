import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CustomerDto } from "src/modules/customer/dto/customer.dto";
import { OwnerDto } from "src/modules/owner/dto/owner.dto";

export class OwnerOtpSendToken {  
    @ApiProperty({ example: '1234', description: 'OTP code sent to phone' })  
    @Expose()
    code: string;

    @ApiProperty({ example: '970599999999', description: 'Phone number' })
    @Expose()
    phone:string

    @ApiProperty({ example: 'signup', description: 'Status of the OTP or customer action',enum: ['login', 'signup'] })
    @Expose()
    status:string
}

export class OwnerOtpVerifyToken {   
    @ApiProperty({ type: OwnerDto}) 
    @Expose()
    @Type(() => OwnerDto) 
    owner: OwnerDto;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Access token for the customer' })
    @Expose()
    accessToken: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh token for the customer' })
    @Expose()
    refreshToken:string

    @ApiProperty({ 
    description: 'Status of the OTP verification', 
    enum: ['login', 'signup'], 
    example: 'login' 
    })
    @Expose()
    status:string
}