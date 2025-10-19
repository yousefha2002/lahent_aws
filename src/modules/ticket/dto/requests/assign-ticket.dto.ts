import {IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
    @ApiProperty()
    @IsNumber()
    ticketId: number;

    @ApiProperty()
    @IsNumber()
    reviewerAdminId: number;
}