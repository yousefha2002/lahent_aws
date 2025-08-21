import { IsNumber, IsOptional, IsString, isString } from 'class-validator';

export class GetNearbyStoresDto {
  @IsNumber()
  currentLat: number;

  @IsNumber()
  currentLng: number;

  // الخيار الأول
  @IsOptional()
  @IsNumber()
  targetLat?: number;

  @IsOptional()
  @IsNumber()
  targetLng?: number;

  // الخيار الثاني
  @IsOptional()
  @IsNumber()
  addressId?: number;

  // الخيار الثالث
  @IsOptional()
  @IsNumber()
  recentAddressId?: number;

  @IsOptional()
  @IsString()
  address?:string
}