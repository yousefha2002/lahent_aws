import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CarBrand } from './entities/car_brand.entity';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { CreateCarBrandDto } from './dto/create_car_brand.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CarBrandService {
    constructor(
        @Inject(repositories.car_brand_repository) private carBrandRep: typeof CarBrand,
        private readonly i18n: I18nService
    ){}

    async create(dto: CreateCarBrandDto,lang=Language.en) {
        const exists = await this.carBrandRep.findOne({ where: { name: dto.name } });
        if (exists) {
            const message = this.i18n.translate('translation.name_exists', { lang });
            throw new BadRequestException(message);
        }
        return this.carBrandRep.create({ ...dto });
    }

    async update(id: number, dto: UpdateCarBrandDto,lang=Language.en) 
    {
        const brand = await this.getOneOrFail(id);
        if (dto.name === brand.name) {
            return brand;
        }
        if (dto.name) {
            const exists = await this.carBrandRep.findOne({where: { name: dto.name }});
            if (exists && exists.id !== id) {
                const message = this.i18n.translate('translation.name_exists', { lang });
                throw new BadRequestException(message);
            }
        }
        return brand.update(dto);
    }

    async getAll() {
        return this.carBrandRep.findAll();
    }

    async getOneOrFail(id: number,lang=Language.en) {
        const brand = await this.carBrandRep.findByPk(id);
        if (!brand) {
            const message = this.i18n.translate('translation.not_found', { lang });
            throw new NotFoundException(message);
        }
        return brand;
    }
}
