import { Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { SimpleCustomerDto } from "src/modules/customer/dto/simple-customer.dto";

export class ReviewDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
    @Expose()
    rating: number;

    @ApiProperty({ example: 'Great store!', description: 'Review comment' })
    @Expose()
    comment: string;

    @ApiProperty({ example: false, description: 'If the review is anonymous' })
    @Expose()
    isAnonymous: boolean;

    @ApiProperty({ type: () => SimpleCustomerDto })
    @Expose()
    @Type(() => SimpleCustomerDto)
    customer: SimpleCustomerDto;
}

export class PaginatedReviewDto {
    @ApiProperty({ example: 10, description: 'Total number of pages' })
    @Expose()
    totalPages: number;

    @ApiProperty({ example: 100, description: 'Total number of reviews' })
    @Expose()
    totalItems: number;

    @ApiProperty({ type: [ReviewDto] })
    @Expose()
    @Type(() => ReviewDto)
    data: ReviewDto[];
}