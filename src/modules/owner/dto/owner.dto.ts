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

    @ApiProperty({example:"تبوك"})
    @Expose()
    city:string

    @ApiProperty({ example:false, description: 'Profile completion status' })
    @Expose()
    isCompletedProfile: boolean;

    @ApiProperty({example:"2025-08-29T10:00:00.000Z"})
    @Expose()
    createdAt:Date
}

export class PaginationOwnerDto {
    @ApiProperty({ type: [OwnerDto] })
    @Expose()
    @Type(() => OwnerDto)
    data: OwnerDto[];

    @ApiProperty({ example: 100 })
    @Expose()
    totalItems: number;

    @ApiProperty({ example: 10 })
    @Expose()
    totalPages: number;
}