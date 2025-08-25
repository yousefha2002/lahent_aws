import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AvatarDto{
    @ApiProperty({ example: 1, description: 'Unique identifier of the avatar' })
    @Expose()
    id:number

    @ApiProperty({ example: 'https://example.com/avatar1.png', description: 'URL of the avatar image' })
    @Expose()
    url:string
}