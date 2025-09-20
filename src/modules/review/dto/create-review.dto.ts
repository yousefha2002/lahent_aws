import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'ID of the order associated with this review', example: 123 })
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', example: 'Great service and fast delivery!' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiPropertyOptional({ description: 'If true, the review will be anonymous', example: true })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}