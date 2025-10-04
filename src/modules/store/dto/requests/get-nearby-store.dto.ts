import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetNearbyStoresDto {
  @ApiProperty({ example: 24.7136, description: 'Current latitude of the customer' })
  @IsNumber()
  currentLat: number;

  @ApiProperty({ example: 46.6753, description: 'Current longitude of the customer' })
  @IsNumber()
  currentLng: number;

  @ApiPropertyOptional({ example: 24.7150, description: 'Target latitude (optional, for range search)' })
  @IsOptional()
  @IsNumber()
  targetLat?: number;

  @ApiPropertyOptional({ example: 46.6800, description: 'Target longitude (optional, for range search)' })
  @IsOptional()
  @IsNumber()
  targetLng?: number;
}