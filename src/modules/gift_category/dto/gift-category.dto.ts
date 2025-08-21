import { Expose } from 'class-transformer';

export class GiftCategoryDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}
