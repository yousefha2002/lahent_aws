import { ApiProperty } from '@nestjs/swagger';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGiftDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone()
  receiverPhone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  giftTemplateId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;
}
