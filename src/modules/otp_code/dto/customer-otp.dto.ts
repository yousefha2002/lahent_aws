import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CustomerDto } from "src/modules/customer/dto/customer.dto";

export class CustomerOtpSendToken {  
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

export class CustomerOtpVerifyToken {   
    @ApiProperty({ type: CustomerDto}) 
    @Expose()
    @Type(() => CustomerDto) 
    customer: CustomerDto;

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