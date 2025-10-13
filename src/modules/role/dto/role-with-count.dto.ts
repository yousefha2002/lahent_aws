import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoleWithCountsDto {
    @Expose()
    @ApiProperty({ description: 'معرف الدور', example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ description: 'اسم الدور', example: 'Admin' })
    name: string;

    @Expose()
    @ApiProperty({ description: 'عدد الإدمن المرتبطين بهذا الدور', example: 5 })
    adminCount: number;

    @Expose()
    @ApiProperty({ description: 'عدد الصلاحيات المرتبطة بهذا الدور', example: 10 })
    permissionCount: number;
}