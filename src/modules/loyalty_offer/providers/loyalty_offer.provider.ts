import { LoyaltyOffer } from './../entites/loyalty_offer.entity';
import { repositories } from 'src/common/enums/repositories';
export const LoyaltyOfferProvider = [
    {
        provide: repositories.loyalty_offer_repository,
        useValue: LoyaltyOffer,
    },
];