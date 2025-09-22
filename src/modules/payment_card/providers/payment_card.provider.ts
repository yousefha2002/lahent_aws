import { repositories } from 'src/common/enums/repositories';
import { PaymentCard } from '../entities/payment_card.entity';
export const PaymentCardProvider = [
    {
        provide: repositories.payment_card_repository,
        useValue: PaymentCard,
    },
];