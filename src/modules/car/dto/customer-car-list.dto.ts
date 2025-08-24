import { Expose, Type } from 'class-transformer';
import { CarBrandDto } from 'src/modules/car_brand/dto/car-brand.dto';
import { CarModelDto } from 'src/modules/car_model/dto/car-model.dto';
import { CarTypeDto } from 'src/modules/car_type/dto/car-type.dto';

class SimpleEntityDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class CustomerCarListDto {
  @Expose()
  id: number;

  @Expose()
  carName: string;

  @Expose()
  plateNumber: string;

  @Expose()
  plateLetters: string;

  @Expose()
  isDefault: boolean;

  @Expose()
  color: boolean;

  @Expose()
  @Type(() => CarTypeDto)
  carType: CarTypeDto;

  @Expose()
  @Type(() => CarBrandDto)
  brand: CarBrandDto;

  @Expose()
  @Type(() => CarModelDto)
  model: CarModelDto;
}
