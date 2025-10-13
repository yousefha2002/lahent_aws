import { IsString, IsArray, ArrayNotEmpty, IsEnum } from 'class-validator';
import { PermissionKey } from 'src/common/enums/permission-key';

export class CreateRoleDto {
    @IsString()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(PermissionKey, { each: true })
    permissions: PermissionKey[];
}