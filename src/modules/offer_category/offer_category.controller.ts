import { Controller } from '@nestjs/common';
import { OfferCategoryService } from './offer_category.service';

@Controller('offer-category')
export class OfferCategoryController {
  constructor(private readonly offerCategoryService: OfferCategoryService) {}
}
