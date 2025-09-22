import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { PaymentCard } from './entities/payment_card.entity';

@Injectable()
export class PaymentCardService {
    constructor(
            @Inject(repositories.payment_card_repository) private paymentCardRepo: typeof PaymentCard
    ){}
}
