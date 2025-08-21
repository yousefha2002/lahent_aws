import { Expose, Type } from 'class-transformer';

export class OwnerDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    phone: string;

    @Expose()
    email: string;
}

export class OnwerWithMessageDto {
    @Expose()
    message: string;

    @Expose()
    @Type(() => OwnerDto) 
    owner: OwnerDto;
}

export class OnwerWithTokenDto {
    @Expose()
    accessToken: string;

    @Expose()
    refreshToken:string

    @Expose()
    @Type(() => OwnerDto) 
    owner: OwnerDto;
}