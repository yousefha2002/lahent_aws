import { repositories } from 'src/common/enums/repositories';
import { Coupon } from '../entities/coupon.entity';
export const CouponProvider = [
    {
        provide: repositories.coupon_repository,
        useValue: Coupon,
    },
];