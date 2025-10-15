import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { simpleRoleDto } from './simple-role.dto';

export class RoleWithCountsDto extends simpleRoleDto{
    @Expose()
    @ApiProperty({ description: 'عدد الإدمن المرتبطين بهذا الدور', example: 5 })
    adminCount: number;

    @Expose()
    @ApiProperty({ description: 'عدد الصلاحيات المرتبطة بهذا الدور', example: 10 })
    permissionCount: number;
}