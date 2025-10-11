import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateStoreLegalInfoDto {
    @IsOptional()
    @ApiPropertyOptional({ description: 'Store tax number' })
    @IsString()
    @IsNotEmpty()
    taxNumber: string;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Store commercial register' })
    @IsString()
    @IsNotEmpty()
    commercialRegister: string;

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    commercialRegisterFile: any;

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    taxNumberFile: any;
}