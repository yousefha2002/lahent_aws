import { PartialType } from '@nestjs/mapped-types';
import { CreateLoyaltyOfferDto } from './create-loyalty-offer.dto';

export class UpdateLoyaltyOfferDto extends PartialType(CreateLoyaltyOfferDto) {}