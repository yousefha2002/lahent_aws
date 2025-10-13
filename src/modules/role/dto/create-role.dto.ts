import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ArrayNotEmpty, IsEnum } from 'class-validator';
import { PermissionKey } from 'src/common/enums/permission-key';

export class CreateRoleDto {
    @ApiProperty({example:"Admin"})
    @IsString()
    name: string;

    @ApiProperty({
        description: 'صلاحيات الدور (يجب اختيار واحدة أو أكثر)',
        example: [PermissionKey.ActivateProduct, PermissionKey.CreateAvatar],
        isArray: true,
        enum: PermissionKey,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(PermissionKey, { each: true })
    permissions: PermissionKey[];
}