import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OwnerDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 'John Doe' })
    @Expose()
    name: string;

    @ApiProperty({ example: '1234567890' })
    @Expose()
    phone: string;

    @ApiProperty({ example: 'owner@example.com' })
    @Expose()
    email: string;

    @ApiProperty({ example:false, description: 'Profile completion status' })
    @Expose()
    isCompletedProfile: boolean;
}

export class OnwerWithMessageDto {
    @ApiProperty({ example: 'Owner created successfully' })
    @Expose()
    message: string;

    @ApiProperty({ type: OwnerDto })
    @Expose()
    @Type(() => OwnerDto)
    owner: OwnerDto;
}