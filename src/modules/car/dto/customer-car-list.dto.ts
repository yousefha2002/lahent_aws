import { Expose, Type } from 'class-transformer';

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
  @Type(() => SimpleEntityDto)
  carType: SimpleEntityDto;

  @Expose()
  @Type(() => SimpleEntityDto)
  brand: SimpleEntityDto;

  @Expose()
  @Type(() => SimpleEntityDto)
  model: SimpleEntityDto;
}
