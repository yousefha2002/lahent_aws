import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
    @ApiProperty({description: 'موضوع التذكرة',example: 'مشكلة في تسجيل الدخول',})
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty({description: 'تفاصيل المشكلة',example: 'عند محاولة تسجيل الدخول تظهر رسالة خطأ',})
    @IsNotEmpty()
    @IsString()
    description: string;
}