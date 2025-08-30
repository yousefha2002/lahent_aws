import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CarBrand } from './entities/car_brand.entity';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { CreateCarBrandDto } from './dto/create_car_brand.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { CarBrandLanguage } from './entities/car_brand.languae.entity';

@Injectable()
export class CarBrandService {
  constructor(
    @Inject(repositories.car_brand_repository)
    private carBrandRep: typeof CarBrand,
    @Inject(repositories.car_brand_langauge_repository)
    private carBrandLanguageRep: typeof CarBrandLanguage,

    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateCarBrandDto, lang = Language.ar) {
    // Validate all names first
    for (const [langCode, name] of Object.entries(dto.names)) {
      const exists = await this.carBrandLanguageRep.findOne({
        where: { name: name, languageCode: langCode },
      });

      if (exists) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }

    // Create base brand
    const brand = await this.carBrandRep.create({});

    // Create all language entries
    for (const [langCode, name] of Object.entries(dto.names)) {
      await this.carBrandLanguageRep.create({
        carBrandId: brand.id,
        languageCode: langCode,
        name: name,
      });
    }

    const message = this.i18n.translate('translation.createdSuccefully', {
      lang,
    });
    return { message };
  }

  async update(id: number, dto: UpdateCarBrandDto, lang = Language.ar) {
    const brand = await this.getOneOrFail(id);

    for (const [langCode, name] of Object.entries(dto.names)) {
      const exists = await this.carBrandLanguageRep.findOne({
        where: { name, languageCode: langCode },
      });

      if (exists && exists.carBrandId !== id) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }

      const brandLang = await this.carBrandLanguageRep.findOne({
        where: { carBrandId: id, languageCode: langCode },
      });

      if (brandLang) {
        await brandLang.update({ name });
      } else {
        await this.carBrandLanguageRep.create({
          carBrandId: id,
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
    return this.carBrandRep.findAll({
      include: [{ model: CarBrandLanguage, where: { languageCode: lang } }],
    });
  }

  async getOneOrFail(id: number, lang = Language.ar) {
    const brand = await this.carBrandRep.findByPk(id, {
      include: [{ model: CarBrandLanguage, where: { languageCode: lang } }],
    });
    if (!brand) {
      const message = this.i18n.translate('translation.not_found', { lang });
      throw new NotFoundException(message);
    }
    return brand;
  }
}
