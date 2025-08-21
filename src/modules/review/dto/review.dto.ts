import { Expose, Type } from "class-transformer";
import { SimpleCustomerDto } from "src/modules/customer/dto/simple-customer.dto";

export class ReviewDto {
    @Expose()
    id: number;

    @Expose()
    rating: number;

    @Expose()
    comment: string;

    @Expose()
    isAnonymous: boolean;

    @Expose()
    @Type(() => SimpleCustomerDto)
    customer: SimpleCustomerDto;
}

export class PaginatedReviewDto {
    @Expose()
    totalPages: number;

    @Expose()
    totalItems: number;

    @Expose()
    @Type(() => ReviewDto)
    data: ReviewDto[];
}