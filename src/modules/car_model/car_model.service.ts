import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CreateCarModelDto } from './dto/create_car_model.dto';
import { UpdateCarModelDto } from './dto/update_car_model.dto';
import { CarModel } from './entites/car_model.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CarModelService {
    constructor(
        @Inject(repositories.car_model_repository)
        private carModelRepo: typeof CarModel,
        private readonly i18n: I18nService,
    ) {}

    async create(dto: CreateCarModelDto, lang = Language.en) {
        const exists = await this.carModelRepo.findOne({
        where: { name: dto.name },
        });

        if (exists) {
        const message =  this.i18n.translate('translation.name_exists', { lang });
        throw new BadRequestException(message);
        }

        return this.carModelRepo.create({ ...dto });
    }

    async update(id: number, dto: UpdateCarModelDto, lang = Language.en) {
        const model = await this.getOneOrFail(id, lang);

        if (dto.name === model.name) {
        return model;
        }

        if (dto.name) {
        const exists = await this.carModelRepo.findOne({
            where: { name: dto.name },
        });

        if (exists && exists.id !== id) {
            const message = this.i18n.translate('translation.name_exists', { lang });
            throw new BadRequestException(message);
        }
        }

        return model.update(dto);
    }

    async getAll() {
        return this.carModelRepo.findAll();
    }

    async getOneOrFail(id: number, lang = Language.en) {
        const model = await this.carModelRepo.findByPk(id);

        if (!model) {
        const message = this.i18n.translate('translation.not_found', { lang });
        throw new NotFoundException(message);
        }

        return model;
    }
}