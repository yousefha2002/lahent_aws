import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { PaymentCard } from './entities/payment_card.entity';
import { CreatePaymentCardDto } from './dto/create-payment-card.dto';
import { UpdatePaymentCardDto } from './dto/update-payment-card.dto';

@Injectable()
export class PaymentCardService {
    constructor(
            @Inject(repositories.payment_card_repository) private paymentCardRepo: typeof PaymentCard
    ){}

    async create(dto: CreatePaymentCardDto,customerId: number) {
        const count = await this.paymentCardRepo.count({ where: { customerId } });
        if (count >= 10) {
            throw new BadRequestException('You cannot add more than 10 payment cards');
        }
        if (dto.isDefault) {
            await this.paymentCardRepo.update({ isDefault: false },{ where: { customerId } });
        }
        const card = await this.paymentCardRepo.create({...dto,customerId});
        return card;
    }

    async update(id: number, dto: UpdatePaymentCardDto,customerId: number) 
    {
        const card = await this.paymentCardRepo.findOne({ where: { id, customerId } });
        if (!card) throw new NotFoundException('Payment card not found');

        if (dto.isDefault) {
            await this.paymentCardRepo.update({ isDefault: false },{ where: { customerId } });
        }

        await card.update(dto);
        return card;
    }

    async delete(id: number, customerId: number) {
        const card = await this.paymentCardRepo.findOne({ where: { id, customerId } });
        if (!card) throw new NotFoundException('Card not found');
        await card.destroy();
        return { message: 'Card deleted' };
    }

    async getAll(customerId: number) {
        return this.paymentCardRepo.findAll({ where: { customerId }, order: [['id','DESC']] });
    }

    async getOne(id: number, customerId: number) {
        const card = await this.paymentCardRepo.findOne({ where: { id, customerId } });
        if (!card) throw new NotFoundException('Card not found');
        return card;
    }
}