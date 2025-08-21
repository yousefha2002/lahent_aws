import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { Store } from '../store/entities/store.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedReviewDto } from './dto/review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(CustomerGuard)
  create(@Body() body: CreateReviewDto, @CurrentUser() customer: Customer) {
    return this.reviewService.createView(customer.id, body);
  }

  @Delete('/:reviewId')
  @UseGuards(CustomerGuard)
  delete(
    @CurrentUser() customer: Customer,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewService.deleteReview(+reviewId, customer.id);
  }

  @Serilaize(PaginatedReviewDto)
  @Get('all')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  getAllReviewsForStore(
    @CurrentUser() store: Store,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.reviewService.getStoreReviews(store.id, +page, +limit);
}
}
