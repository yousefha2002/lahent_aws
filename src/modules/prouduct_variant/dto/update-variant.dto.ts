import { IsNumber, Min, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductVariantDto {
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'price must be a number' })
    @Min(0, { message: 'price must be a positive number' })
    @IsNotEmpty()
    additionalPrice: number;

    @ApiPropertyOptional({
    description: 'JSON string of variant languages',
    example: JSON.stringify([
        { languageCode: 'en', name: 'Small' },
        { languageCode: 'ar', name: 'صغير' },
        ]),
    })
    @IsOptional()
    @IsString()
    languages?: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Upload a new image for the variant (optional)' })
    @IsOptional()
    image?: any;
}