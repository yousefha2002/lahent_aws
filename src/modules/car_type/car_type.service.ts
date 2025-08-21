import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CreateCarTypeDto } from './dto/create_car_type.dto';
import { UpdateCarTypeDto } from './dto/update_car_type.dto';
import { CarType } from './entites/car_type.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CarTypeService {
    constructor(
        @Inject(repositories.car_type_repository) private carTypeRepo: typeof CarType,
        private readonly i18n: I18nService,
    ) {}

    async create(dto: CreateCarTypeDto, lang = Language.en) {
        const exists = await this.carTypeRepo.findOne({ where: { name: dto.name } });

        if (exists) {
        const message = this.i18n.translate('translation.name_exists', { lang });
        throw new BadRequestException(message);
        }

        return this.carTypeRepo.create({ ...dto });
    }

    async update(id: number, dto: UpdateCarTypeDto, lang = Language.en) {
        const type = await this.getOneOrFail(id, lang);

        if (dto.name === type.name) {
        return type;
        }

        if (dto.name) {
        const exists = await this.carTypeRepo.findOne({ where: { name: dto.name } });

        if (exists && exists.id !== id) {
            const message = this.i18n.translate('translation.name_exists', { lang });
            throw new BadRequestException(message);
        }
        }

        return type.update(dto);
    }

    async getAll() {
        return this.carTypeRepo.findAll();
    }

    async getOneOrFail(id: number, lang = Language.en) {
        const type = await this.carTypeRepo.findByPk(id);

        if (!type) {
        const message = this.i18n.translate('translation.not_found', { lang });
        throw new NotFoundException(message);
        }

        return type;
    }
}