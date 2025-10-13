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

    @ApiProperty({ example: '+123456789', description: 'Customer phone number' })
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
}