import { PermissionKey } from 'src/common/enums/permission-key';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SimpleAdminDto } from './simple-admin.dto';

export class AdminWithPermissionsDto extends SimpleAdminDto{
    @Expose()
    @ApiProperty()
    isSuperAdmin: boolean;

    @Expose()
    @ApiProperty({ type: [String] })
    permissions: PermissionKey[];
}