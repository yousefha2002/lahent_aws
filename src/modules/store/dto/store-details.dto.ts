import { Expose, Type } from 'class-transformer';
import { OpeningHourDTO } from 'src/modules/opening_hour/dto/opening-hour.dto';

export class StoreDetailsDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  logoUrl: string;

  @Expose()
  coverUrl: string;

  @Expose()
  phone: string;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  commercialRegister: string;

  @Expose()
  taxNumber: string;

  @Expose()
  drive_thru: boolean;

  @Expose()
  city:string

  @Expose()
  in_store: boolean;

  @Expose()
  @Type(() => OpeningHourDTO) // <--- add this decorator!
  openingHours: OpeningHourDTO[];
}
