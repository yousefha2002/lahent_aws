import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Review } from './entities/review.entity';
import { StoreService } from '../store/services/store.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Customer } from '../customer/entities/customer.entity';
import { OrderService } from '../order/services/order.service';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(repositories.review_repository)
    private reviewRepo: typeof Review,
    private readonly storeService: StoreService,
    private readonly orderService: OrderService,
  ) {}

  async createReview(customerId: number, dto: CreateReviewDto) {
    const [store, count] = await Promise.all([
      this.storeService.storeById(dto.storeId),
      this.orderService.countRecivedOrderForCustomer(
        dto.orderId,
        customerId,
        dto.storeId,
      ),
    ]);

    if (!store) {
      throw new BadRequestException('Invalid store');
    }

    if (count === 0) {
      throw new BadRequestException('No order recived to review store');
    }

    // 1. Create review
    await this.reviewRepo.create({
      customerId,
      storeId: dto.storeId,
      comment: dto.comment,
      rating: dto.rating,
      isAnonymous: dto.isAnonymous ?? false,
    });

    // 2. Update store rating
    const newNumberOfRates = store.numberOfRates + 1;
    const newRate =
      (store.rate * store.numberOfRates + dto.rating) / newNumberOfRates;

    await store.update({
      rate: newRate,
      numberOfRates: newNumberOfRates,
    });

    return { message: 'Review created successfully' };
  }

  async deleteReview(reviewId: number, customerId: number) {
    // 1. Find the review
    const review = await this.reviewRepo.findByPk(reviewId);
    if (!review) {
      throw new BadRequestException('Review not found');
    }

    // (Optional) check that the customer owns the review before deleting
    if (review.customerId !== customerId) {
      throw new BadRequestException('You cannot delete this review');
    }

    // 2. Get store before deleting
    const store = await this.storeService.storeById(review.storeId);
    if (!store) {
      throw new BadRequestException('Invalid store');
    }

    // 3. Delete review
    await review.destroy();

    // 4. Update store rating + numberOfRates
    if (store.numberOfRates > 1) {
      const newNumberOfRates = store.numberOfRates - 1;
      const newRate =
        (store.rate * store.numberOfRates - review.rating) / newNumberOfRates;

      await store.update({
        rate: newRate,
        numberOfRates: newNumberOfRates,
      });
    } else {
      // If this was the only review
      await store.update({
        rate: 0,
        numberOfRates: 0,
      });
    }

    return { message: 'Review deleted successfully' };
  }

  async getStoreReviews(storeId: number, page = 1, limit = 10,rating?: number) {
    const offset = (page - 1) * limit;
    const where: any = { storeId };
    if (rating) {
      where.rating = rating;
    }

    const { rows, count } = await this.reviewRepo.findAndCountAll({
      where,
      include: [Customer],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}
