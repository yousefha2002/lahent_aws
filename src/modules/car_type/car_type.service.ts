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
import { CarTypeLanguage } from './entites/car_type_language.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CarTypeService {
  constructor(
    @Inject(repositories.car_type_repository)
    private carTypeRepo: typeof CarType,

    @Inject(repositories.car_type_langauge_repository)
    private carTypeLanguageRepo: typeof CarTypeLanguage,

    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateCarTypeDto, lang = Language.en) {
    // Validate all names first
    for (const [langCode, name] of Object.entries(dto.names)) {
      const exists = await this.carTypeLanguageRepo.findOne({
        where: { name, languageCode: langCode },
      });

      if (exists) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }

    // Create base type
    const type = await this.carTypeRepo.create({});

    // Create language entries
    for (const [langCode, name] of Object.entries(dto.names)) {
      await this.carTypeLanguageRepo.create({
        carTypeId: type.id,
        languageCode: langCode,
        name,
      });
    }

    const message = this.i18n.translate('translation.createdSuccefully', {
      lang,
    });
    return { message };
  }

  async update(id: number, dto: UpdateCarTypeDto, lang = Language.en) {
    const type = await this.getOneOrFail(id);

    // Validate names
    for (const [langCode, name] of Object.entries(dto.names)) {
      const exists = await this.carTypeLanguageRepo.findOne({
        where: { name, languageCode: langCode },
      });

      if (exists && exists.carTypeId !== id) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }
      const typeLang = await this.carTypeLanguageRepo.findOne({
        where: { carTypeId: id, languageCode: langCode },
      });

      if (typeLang) {
        await typeLang.update({ name });
      } else {
        await this.carTypeLanguageRepo.create({
          carTypeId: id,
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

  async getAll(lang = Language.en) {
    return this.carTypeRepo.findAll({
      include: [{ model: CarTypeLanguage, where: { languageCode: lang } }],
    });
  }

  async getOneOrFail(id: number, lang = Language.en) {
    const type = await this.carTypeRepo.findByPk(id, {
      include: [{ model: CarTypeLanguage, where: { languageCode: lang } }],
    });

    if (!type) {
      const message = this.i18n.translate('translation.not_found', { lang });
      throw new NotFoundException(message);
    }

    return type;
  }
}
