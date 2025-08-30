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
import { CarModelLanguage } from './entites/car_mode_language.entity';

@Injectable()
export class CarModelService {
  constructor(
    @Inject(repositories.car_model_repository)
    private carModelRepo: typeof CarModel,

    @Inject(repositories.car_model_langauge_repository)
    private carModelLanguageRepo: typeof CarModelLanguage,

    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateCarModelDto, lang = Language.ar) {
    // Validate names
    for (const [langCode, name] of Object.entries(dto.names)) {
      const exists = await this.carModelLanguageRepo.findOne({
        where: { name, languageCode: langCode },
      });

      if (exists) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }

    // Create base model
    const model = await this.carModelRepo.create({});

    // Create language entries
    for (const [langCode, name] of Object.entries(dto.names)) {
      await this.carModelLanguageRepo.create({
        carModelId: model.id,
        languageCode: langCode,
        name,
      });
    }

    const message = this.i18n.translate('translation.createdSuccefully', {
      lang,
    });
    return { message };
  }

  async update(id: number, dto: UpdateCarModelDto, lang = Language.ar) {
    const model = await this.getOneOrFail(id);

    // Validate names
    for (const [langCode, name] of Object.entries(dto.names)) {
      const exists = await this.carModelLanguageRepo.findOne({
        where: { name, languageCode: langCode },
      });

      if (exists && exists.carModelId !== id) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }
      const modelLang = await this.carModelLanguageRepo.findOne({
        where: { carModelId: id, languageCode: langCode },
      });

      if (modelLang) {
        await modelLang.update({ name });
      } else {
        await this.carModelLanguageRepo.create({
          carModelId: id,
          languageCode: langCode,
          name,
        });
      }
    }

    const message = this.i18n.translate('translation.updatedSuccefully', {
      lang,
    });
    return { message };
  }

  async getAll(lang = Language.ar) {
    return this.carModelRepo.findAll({
      include: [{ model: CarModelLanguage, where: { languageCode: lang } }],
    });
  }

  async getOneOrFail(id: number, lang = Language.ar) {
    const model = await this.carModelRepo.findByPk(id, {
      include: [{ model: CarModelLanguage, where: { languageCode: lang } }],
    });

    if (!model) {
      const message = this.i18n.translate('translation.not_found', { lang });
      throw new NotFoundException(message);
    }

    return model;
  }
}
