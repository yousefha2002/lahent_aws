import { PermissionKey } from 'src/common/enums/permission-key';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AdminWithPermissionsDto {
    @Expose()
    @ApiProperty()
    id: number;

    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty()
    phone: string;

    @Expose()
    @ApiProperty()
    active: boolean;

    @Expose()
    @ApiProperty()
    isSuperAdmin: boolean;

    @Expose()
    @ApiProperty({ type: [String] })
    permissions: PermissionKey[];
}