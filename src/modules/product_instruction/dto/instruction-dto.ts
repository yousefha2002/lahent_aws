import { Expose, Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Language } from "src/common/enums/language";

export class InstructionDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Cooking Instructions' })
    name: string;
}

export class InstructionLanguageDto {
    @Expose()
    @IsString()
    @IsIn(Object.values(Language))
    @ApiProperty({ example: 'en' })
    languageCode: Language;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Boil for 5 minutes' })
    name: string;
}

export class ProductInstructionDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @Type(() => InstructionLanguageDto)
    @ApiProperty({ type: [InstructionLanguageDto] })
    languages: InstructionLanguageDto[];

    @Expose()
    @ApiProperty({ example: true })
    isActive: boolean;
}