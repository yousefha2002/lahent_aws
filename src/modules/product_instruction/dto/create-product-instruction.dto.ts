import { Type } from "class-transformer";
import { IsArray, IsInt, ValidateNested } from "class-validator";
import { InstructionLanguageDto } from "./instruction-dto";

export class CreateProductInstructionDto {
    @IsInt()
    productId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstructionLanguageDto)
    languages: InstructionLanguageDto[];
}