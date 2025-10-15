import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleAdminDto } from './simple-admin.dto';
import { simpleRoleDto } from 'src/modules/role/dto/simple-role.dto';

export class AdminListDto extends SimpleAdminDto {
    @Expose()
    @ApiProperty({type:simpleRoleDto})
    @Type(()=>simpleRoleDto)
    role: simpleRoleDto
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
    @Type(()=>AdminListDto)
    data: AdminListDto[];
}
