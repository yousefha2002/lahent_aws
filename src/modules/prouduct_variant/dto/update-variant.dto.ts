import { IsNumber, Min, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductVariantDto {
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'price must be a number' })
    @Min(0, { message: 'price must be a positive number' })
    @IsNotEmpty()
    additional_price: number;

    @IsOptional()
    @IsString()
    languages?: string;
}