import { Expose, Type } from "class-transformer";
import { CustomerDto } from "src/modules/customer/dto/customer.dto";

export class CustomerOtpSendToken {    
    @Expose()
    code: string;

    @Expose()
    phone:string

    @Expose()
    status:string
}

export class CustomerOtpVerifyToken {    
    @Expose()
    @Type(() => CustomerDto) 
    customer: CustomerDto;

    @Expose()
    accessToken: string;

    @Expose()
    refreshToken:string

    @Expose()
    status:string
}