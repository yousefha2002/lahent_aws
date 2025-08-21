import { Expose, Type } from "class-transformer";
import { CouponDto } from "./coupon.dto";

export class PaginatedCouponDto {
    @Expose()
    totalPages:number;

    @Expose()
    @Type(() => CouponDto)
    data: CouponDto;
}