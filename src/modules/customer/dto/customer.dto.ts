import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class SimpleEntityDto {
    @ApiProperty({ example: 1, description: 'ID of the entity' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'URL of the avatar' })
    @Expose()
    url: string;
}

export class CustomerDto {
    @ApiProperty({ example: 123, description: 'Customer ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: '970599999999', description: 'Phone number' })
    @Expose()
    phone: string;

    @ApiProperty({ example: 'John Doe', description: 'Customer name', nullable: true  })
    @Expose()
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address' , nullable: true })
    @Expose()
    email: string;

    @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Customer image URL', nullable: true  })
    @Expose()
    imageUrl: string;

    @ApiProperty({ example: 50, description: 'Points earned by customer' })
    @Expose()
    points: number;

    @ApiProperty({ example: 100.5, description: 'Wallet balance' })
    @Expose()
    walletBalance: number;

    @ApiProperty({ example:false, description: 'Profile completion status' })
    @Expose()
    isCompletedProfile: boolean;

    @ApiProperty({ type: SimpleEntityDto , nullable: true })
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