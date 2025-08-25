import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OpeningHourDTO } from 'src/modules/opening_hour/dto/opening-hour.dto';

export class StoreDetailsDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  @Expose()
  logoUrl: string;

  @ApiProperty({ example: 'https://example.com/cover.png' })
  @Expose()
  coverUrl: string;

  @ApiProperty({ example: '+966501234567' })
  @Expose()
  phone: string;

  @ApiProperty({ example: 46.6753 })
  @Expose()
  lng: number;

  @ApiProperty({ example: 24.7136 })
  @Expose()
  lat: number;

  @ApiProperty({ example: '1234567890' })
  @Expose()
  commercialRegister: string;

  @ApiProperty({ example: '123456789' })
  @Expose()
  taxNumber: string;

  @ApiProperty({ example: true })
  @Expose()
  drive_thru: boolean;

  @ApiProperty({ example: 'Riyadh' })
  @Expose()
  city: string;

  @ApiProperty({ example: true })
  @Expose()
  in_store: boolean;

  @ApiProperty({ type: [OpeningHourDTO] })
  @Expose()
  @Type(() => OpeningHourDTO)
  openingHours: OpeningHourDTO[];
}