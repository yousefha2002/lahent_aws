import {Body,Controller,Delete,Get,Param,Post,Query,UseGuards} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedReviewDto } from './dto/review.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN])
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
  create(@Body() body: CreateReviewDto, @CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.reviewService.createReview(context.id, body);
  }

  @Delete('/:reviewId')
  @PermissionGuard([RoleStatus.CUSTOMER])
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
    @CurrentUser() user: CurrentUserType,
    @Param('reviewId') reviewId: string,
  ) {
    const {context} = user
    return this.reviewService.deleteReview(+reviewId, context.id);
  }

  @Serilaize(PaginatedReviewDto)
  @Get('all')
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.ViewStoreReviews)
  @ApiOperation({ summary: 'Get all reviews for a store with pagination' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'rating', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reviews for the store',
    type: PaginatedReviewDto,
  })
  getAllReviewsForStore(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('rating') rating?: number
  ) {
    const {context} = user
    return this.reviewService.getStoreReviews(context.id, +page, +limit,rating);
  }
}
