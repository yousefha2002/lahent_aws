import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeOfferActiveDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
