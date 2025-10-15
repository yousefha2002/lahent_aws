import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class simpleRoleDto {
    @Expose()
    @ApiProperty({ description: 'معرف الدور', example: 1 })
    id: number;
    
    @Expose()
    @ApiProperty({ description: 'اسم الدور', example: 'Admin' })
    name: string;
}