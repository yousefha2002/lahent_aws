import { Expose, Type } from 'class-transformer';

class SimpleEntityDto {
    @Expose()
    id: number;

    @Expose()
    url: string;
}

export class SimpleCustomerDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    imageUrl: string;

    @Expose()
    phone: string;
    
    @Expose()
    @Type(() => SimpleEntityDto)
    avatar: SimpleEntityDto;
}