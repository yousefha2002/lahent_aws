import { Expose, Type } from 'class-transformer';

class SimpleEntityDto {
    @Expose()
    id: number;

    @Expose()
    url: string;
}

export class CustomerDto {
    @Expose()
    id: number;

    @Expose()
    phone: string;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    imageUrl: string;

    @Expose()
    points: number;

    @Expose()
    walletBalance: number;

    @Expose()
    isCompletedProfile: number;
    
    @Expose()
    @Type(() => SimpleEntityDto)
    avatar: SimpleEntityDto;
}

export class CustomerDtoWithMessageToken {
    @Expose()
    message: string;
    
    @Expose()
    @Type(() => CustomerDto) 
    customer: CustomerDto;

    @Expose()
    accessToken: string;

    @Expose()
    refreshToken:string
}