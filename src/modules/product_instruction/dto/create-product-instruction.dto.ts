import { Type } from "class-transformer";
import { IsArray, IsInt, ValidateNested, IsNotEmpty } from "class-validator";
import { InstructionLanguageDto } from "./instruction-dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductInstructionDto {
    @ApiProperty({ example: 5, description: 'ID of the product' })
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @ApiProperty({
        type: [InstructionLanguageDto],
        description: 'Instruction translations in multiple languages',
        example: [
        { language: 'en', text: 'Cook for 10 minutes' },
        { language: 'ar', text: 'اطبخ لمدة 10 دقائق' },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstructionLanguageDto)
    languages: InstructionLanguageDto[];
}
