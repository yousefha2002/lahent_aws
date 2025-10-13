// src/modules/role/dto/role-with-details.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AdminSummaryDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    phone: string;
}

export class PermissionSummaryDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    permission: string;
}

export class RoleWithDetailsDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ type: [PermissionSummaryDto] })
    rolePermissions: PermissionSummaryDto[];

    @ApiProperty({ type: [AdminSummaryDto] })
    admins: AdminSummaryDto[];
}
