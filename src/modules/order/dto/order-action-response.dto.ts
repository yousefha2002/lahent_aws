import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderActionResponseDto {
    @Expose()
    @ApiProperty({ description: 'Indicates if the action was successful', example: true })
    success: boolean;

    @Expose()
    @ApiProperty({ description: 'Message describing the result of the action', example: 'the result of the action' })
    message: string;
}