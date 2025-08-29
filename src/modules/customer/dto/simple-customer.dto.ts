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

export class SimpleCustomerDto {
    @ApiProperty({ example: 101, description: 'Customer ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'John Doe', description: 'Customer name' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'https://example.com/image.png', description: 'Customer image URL' })
    @Expose()
    imageUrl: string;

    @ApiProperty({ example: '+123456789', description: 'Customer phone number' })
    @Expose()
    phone: string;
    
    @ApiProperty({ type: () => SimpleEntityDto, description: 'Customer avatar entity' })
    @Expose()
    @Type(() => SimpleEntityDto)
    avatar: SimpleEntityDto;
}
