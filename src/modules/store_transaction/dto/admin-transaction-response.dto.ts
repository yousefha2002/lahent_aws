import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AdminTransactionResponse {
    @Expose()
    @ApiProperty({ example: 'تمت العملية بنجاح', description: 'Success message in selected language' })
    message: string;
}