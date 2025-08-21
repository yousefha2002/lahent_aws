import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { OfferProductService } from './offer_product.service';

@Controller('offer-product')
export class OfferProductController {
  constructor(private readonly offerProductService: OfferProductService) {}
}
