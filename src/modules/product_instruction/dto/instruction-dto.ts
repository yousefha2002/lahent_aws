import { Expose, Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { Language } from "src/common/enums/language";

export class InstructionDto {
    @Expose()
    id: number;

    @Expose()
    name: string;
}

export class InstructionLanguageDto {
    @Expose()
    @IsString()
    @IsIn(Object.values(Language))
    languageCode: Language;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class ProductInstructionDto {
    @Expose()
    id:number

    @Expose()
    @Type(() => InstructionLanguageDto)
    languages: InstructionLanguageDto[];

    @Expose()
    isActive:boolean
}