import {
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsNotEmpty()
  storeId: number;

  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
