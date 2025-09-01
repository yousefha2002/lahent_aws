import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { UpdateAddressDto } from './dto/update-address.dto';

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

    async update(customerId: number,addressId: number,dto: UpdateAddressDto,lang = Language.en)
    {
        const address = await this.findOneOrFail(addressId, customerId, lang);
        Object.assign(address, dto);
        await address.save();
        return address
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
}
