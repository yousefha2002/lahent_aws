import { repositories } from 'src/common/enums/repositories';
import { PaymentSession } from '../entities/payment_session.entity';
export const PaymentSessionProvider = [
    {
        provide: repositories.payment_session_repository,
        useValue: PaymentSession,
    },
];