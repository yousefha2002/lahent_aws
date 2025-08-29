import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AdminDto {
    @ApiProperty({example:1})
    @Expose()
    id:string;

    @ApiProperty({example:"admin@gmail.com"})
    @Expose()
    email:string;
}