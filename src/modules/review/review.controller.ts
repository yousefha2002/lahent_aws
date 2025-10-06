import {Body,Controller,Delete,Get,Param,Post,Query,UseGuards} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { ApprovedStoreGuard } from 'src/common/guards/approved-store.guard';
import { Store } from '../store/entities/store.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedReviewDto } from './dto/review.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { StoreGuard } from 'src/common/guards/store.guard';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Create a review for a store/order' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    schema: {
      example: { message: 'Review created successfully' },
    },
  })
  create(@Body() body: CreateReviewDto, @CurrentUser() customer: Customer) {
    return this.reviewService.createReview(customer.id, body);
  }

  @Delete('/:reviewId')
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'reviewId', type: Number, description: 'ID of the review to delete', example: 12 })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
    schema: {
      example: { message: 'Review deleted successfully' },
    },
  })
  delete(
    @CurrentUser() customer: Customer,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewService.deleteReview(+reviewId, customer.id);
  }

  @Serilaize(PaginatedReviewDto)
  @Get('all')
  @UseGuards(StoreGuard, ApprovedStoreGuard)
  @ApiOperation({ summary: 'Get all reviews for a store with pagination' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'rating', required: false, type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reviews for the store',
    type: PaginatedReviewDto,
  })
  getAllReviewsForStore(
    @CurrentUser() store: Store,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('rating') rating?: number
  ) {
    return this.reviewService.getStoreReviews(store.id, +page, +limit,rating);
  }
}
