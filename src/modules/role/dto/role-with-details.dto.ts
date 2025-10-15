import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleAdminDto } from 'src/modules/admin/dto/simple-admin.dto';
import { simpleRoleDto } from './simple-role.dto';

export class PermissionSummaryDto {
    @Expose()
    @ApiProperty()
    id: number;

    @Expose()
    @ApiProperty()
    permission: string;
}

export class RoleWithDetailsDto extends simpleRoleDto {
    @ApiProperty({ type: [PermissionSummaryDto] })
    @Expose()
    @Type(()=>PermissionSummaryDto)
    rolePermissions: PermissionSummaryDto[];

    @Expose()
    @ApiProperty({ type: [SimpleAdminDto] })
    @Type(()=>SimpleAdminDto)
    admins: SimpleAdminDto[];
}
