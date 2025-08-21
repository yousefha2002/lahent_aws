import { repositories } from 'src/common/enums/repositories';
import { Offer } from '../entities/offer.entity';
export const OfferProvider = [
    {
        provide: repositories.offer_repository,
        useValue: Offer,
    },
];