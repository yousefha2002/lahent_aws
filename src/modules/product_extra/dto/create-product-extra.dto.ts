import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsInt, ValidateNested } from 'class-validator';
import { ProductExtraDto } from './extra-dto';

export class CreateProductExtraDto {
    @ApiProperty({ example: 15, description: 'Product ID' })
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @ApiProperty({ type: [ProductExtraDto], description: 'List of extras for the product' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductExtraDto)
    extras: ProductExtraDto[];
}