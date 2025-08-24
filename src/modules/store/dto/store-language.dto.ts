import { Expose } from "class-transformer";

export class StoreLanguageDto {
    @Expose()
    name: string;

    @Expose()
    languageCode: string;
}