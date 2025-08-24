import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Language } from "src/common/enums/language";

export class StoreLanguageActionDto {
    @IsEnum(Language)
    languageCode: Language;

    @IsString()
    @IsNotEmpty()
    name:string
}