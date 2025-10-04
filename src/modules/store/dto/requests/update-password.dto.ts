import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDto {
    @ApiProperty({ description: 'Current password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(30, { message: 'Password must be at most 30 characters' })
    oldPassword: string;

    @ApiProperty({ description: 'New password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(30, { message: 'Password must be at most 30 characters' })
    newPassword: string;
}