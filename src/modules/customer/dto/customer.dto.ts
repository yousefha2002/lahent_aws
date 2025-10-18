import { CustomerStatus } from './../../../common/enums/customer_status';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleEntityDto {
    @ApiProperty({ example: 1, description: 'ID of the entity' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'https://example.com/avatar.png', description: 'URL of the entity image' })
    @Expose()
    url: string;
}

export class CustomerSummaryDto {
    @ApiProperty({ example: 101, description: 'Customer ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'John Doe', description: 'Customer name' })
    @Expose()
    name: string;

    @ApiProperty({ example: '96651231234', description: 'Customer phone number' })
    @Expose()
    phone: string;
    
    @ApiProperty({ type: () => SimpleEntityDto, description: 'Customer avatar entity' })
    @Expose()
    @Type(() => SimpleEntityDto)
    avatar: SimpleEntityDto;
}

export class CustomerDetailsDto extends CustomerSummaryDto {
    @ApiProperty({ example: 50, description: 'Points earned by customer' })
    @Expose()
    points: number;

    @ApiProperty({ example: 100.5, description: 'Wallet balance' })
    @Expose()
    walletBalance: number;

    @ApiProperty({ example: false, description: 'Profile completion status' })
    @Expose()
    isCompletedProfile: boolean;

    @ApiProperty({enum:CustomerStatus})
    @Expose()
    status:CustomerStatus

    @ApiProperty({ example: 'yousef@gmail.com', description: 'Customer email' })
    @Expose()
    email: string;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z',})
    @Expose()
    createdAt: Date;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z'})
    @Expose()
    lastActive: Date | null;
}


export class PaginationCustomerDto {
    @Expose()
    @ApiProperty({ type: [CustomerDetailsDto] })
    @Type(()=>CustomerDetailsDto)
    data: CustomerDetailsDto[];

    @Expose()
    @ApiProperty()
    totalItems: number;

    @Expose()
    @ApiProperty()
    totalPages: number;
}