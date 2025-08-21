import { RecentAddress } from './entities/recent_address.entity';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Op } from 'sequelize';
import { Language } from 'src/common/enums/language';
import { repositories } from 'src/common/enums/repositories';

@Injectable()
export class RecentAddressService {
    constructor(
        @Inject(repositories.recent_address_repository)private recentAddressRepo: typeof RecentAddress,
        private readonly i18n: I18nService
    ){}
    

    async findOneOrFail(addressId:number, customerId:number,lang=Language.en)
    {
        const address = await this.recentAddressRepo.findOne({ where: { id: addressId, customerId } });
        if (!address) {
            const msg = this.i18n.translate('translation.not_found', { lang });
            throw new NotFoundException(msg);
        }
        return address
    }

    async addRecentAddress(customerId: number, dto: { lat: number, lng: number, address: string }) 
    {
        const exists = await this.recentAddressRepo.findOne({
            where: {
                customerId,
                lat: {
                [Op.between]: [dto.lat - 0.0001, dto.lat + 0.0001]
                },
                lng: {
                [Op.between]: [dto.lng - 0.0001, dto.lng + 0.0001]
                }
            }
        });
        if (exists) return;

        const count = await this.recentAddressRepo.count({ where: { customerId } });

        if (count >= 5) {
            const oldest = await this.recentAddressRepo.findOne({
            where: { customerId },
            order: [['createdAt', 'ASC']],
            });
            if (oldest) await oldest.destroy();
        }

        await this.recentAddressRepo.create({
            ...dto,
            customerId
        });
    }

    async getAllRecentAddresses(customerId: number) {
        return this.recentAddressRepo.findAll({where: { customerId },order: [['createdAt', 'DESC']]});
    }

    async removeRecentAddress(addressId: number, customerId: number, lang = Language.en) 
    {
        const address = await this.findOneOrFail(addressId, customerId,lang)
        await address.destroy();
        const msg = this.i18n.translate('translation.deletedSuccefully', { lang });
        return { message: msg };
    }
}
