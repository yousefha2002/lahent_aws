import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CarBrandDto } from 'src/modules/car_brand/dto/car-brand.dto';
import { CarModelDto } from 'src/modules/car_model/dto/car-model.dto';
import { CarTypeDto } from 'src/modules/car_type/dto/car-type.dto';

export class CustomerCarListDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'My Car' })
  carName: string;

  @Expose()
  @ApiProperty({ example: '1234' })
  plateNumber: string;

  @Expose()
  @ApiProperty({ example: 'AB' })
  plateLetters: string;

  @Expose()
  @ApiProperty({ example: true })
  isDefault: boolean;

  @Expose()
  @ApiProperty({ example: '#333' })
  color: string;

  @Expose()
  @Type(() => CarTypeDto)
  @ApiProperty({ type: CarTypeDto })
  carType: CarTypeDto;

  @Expose()
  @Type(() => CarBrandDto)
  @ApiProperty({ type: CarBrandDto })
  brand: CarBrandDto;

  @Expose()
  @Type(() => CarModelDto)
  @ApiProperty({ type: CarModelDto })
  model: CarModelDto;
}