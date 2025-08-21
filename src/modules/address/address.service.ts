import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class AddressService {
    constructor(
        @Inject(repositories.address_repository) private addressRepo: typeof Address,
        private readonly i18n: I18nService
    ){}

    async create(customerId: number, dto: CreateAddressDto,lang=Language.en) 
    {
        const addressCount = await this.addressRepo.count({ where: { customerId } });
        if (addressCount >= 8) {
            const msg = this.i18n.translate('translation.address.max_limit', { lang });
            throw new BadRequestException(msg);
        }
        const existingLabel = await this.addressRepo.findOne({where: { customerId, label: dto.label }});
        if (existingLabel) {
            const msg = this.i18n.translate('translation.name_exists', { lang });
            throw new BadRequestException(msg);
        }
        return this.addressRepo.create({ ...dto, customerId });
    }

    async remove(customerId: number, addressId: number,lang=Language.en) 
    {
        const address = await this.findOneOrFail(addressId, customerId)
        await address.destroy();
        const msg = this.i18n.translate('translation.deletedSuccefully', { lang });
        return { message: msg }
    }

    async getAll(customerId: number) {
        return this.addressRepo.findAll({where: { customerId },order: [['createdAt', 'DESC']]});
    }

    async findOneOrFail(addressId:number, customerId:number,lang=Language.en)
    {
        const address = await this.addressRepo.findOne({ where: { id: addressId, customerId } });
        if (!address) {
            const msg = this.i18n.translate('translation.not_found', { lang });
            throw new NotFoundException(msg);
        }
        return address
    }

    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance; // بالكيلومتر
    }

    isBetween(lat: number, lng: number,lat1: number, lng1: number,lat2: number, lng2: number): boolean {
        const minLat = Math.min(lat1, lat2);
        const maxLat = Math.max(lat1, lat2);
        const minLng = Math.min(lng1, lng2);
        const maxLng = Math.max(lng1, lng2);
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    }
}
