import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AdminListDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Yousef' })
    name: string;

    @Expose()
    @ApiProperty({ example: '966500000000' })
    phone: string;

    @Expose()
    @ApiProperty({ example: true })
    active: boolean;

    @Expose()
    @ApiProperty({ example: { id: 2, name: 'Manager' } })
    role: { id: number; name: string };
}

export class PaginatedAdminsResponseDto {
    @ApiProperty({ example: 25 })
    @Expose()
    total: number;

    @ApiProperty({ example: 25 })
    @Expose()
    totalPages:number

    @Expose()
    @ApiProperty({ type: [AdminListDto] })
    data: AdminListDto[];
}
