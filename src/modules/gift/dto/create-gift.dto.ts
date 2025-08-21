import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGiftDto {
  @IsNotEmpty()
  @IsMobilePhone()
  receiverPhone: string;

  @IsString()
  @IsOptional()
  receiverName?: string;

  @IsNumber()
  @IsNotEmpty()
  giftTemplateId: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;
}
