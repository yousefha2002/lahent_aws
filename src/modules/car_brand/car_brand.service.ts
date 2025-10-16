import { AuditLogService } from './../audit_log/audit_log.service';
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
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class CarBrandService {
  constructor(
    @Inject(repositories.car_brand_repository)
    private carBrandRep: typeof CarBrand,
    @Inject(repositories.car_brand_langauge_repository)
    private carBrandLanguageRep: typeof CarBrandLanguage,
    private readonly auditLogService:AuditLogService,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateCarBrandDto, actor: ActorInfo, lang: Language) 
  {
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

    const brand = await this.carBrandRep.create({});

    for (const [langCode, name] of Object.entries(dto.names)) {
      await this.carBrandLanguageRep.create({
        carBrandId: brand.id,
        languageCode: langCode,
        name: name,
      });
    }

    const newEntity = { ...dto.names }; 

    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.CARBRAND, 
      action: AuditLogAction.CREATE,
      entityId: brand.id,
      newEntity,
      fieldsToExclude: [],
    });

    const message = this.i18n.translate('translation.createdSuccefully', { lang });
    return { message };
  }

  async update(id: number, actor: ActorInfo, dto: UpdateCarBrandDto, lang :Language) 
  {
    const brand = await this.getOneOrFail(id);

    const oldLanguages = await this.carBrandLanguageRep.findAll({
      where: { carBrandId: id },
    });
    const oldEntity = oldLanguages.reduce((acc, item) => {
      acc[item.languageCode] = item.name;
      return acc;
    }, {} as Record<string, string>);

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

    const newLanguages = await this.carBrandLanguageRep.findAll({
      where: { carBrandId: id },
    });
    const newEntity = newLanguages.reduce((acc, item) => {
      acc[item.languageCode] = item.name;
      return acc;
    }, {} as Record<string, string>);

    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.CARBRAND,
      action: AuditLogAction.UPDATE,
      entityId: brand.id,
      oldEntity,
      newEntity,
      fieldsToExclude: []
    });

    const message = this.i18n.translate('translation.updatedSuccefully', {lang});
    return { message };
  }

  async getAll(lang?: Language) 
  {
    const includeOptions: any = { model: CarBrandLanguage };
    if (lang) {
      includeOptions.where = { languageCode: lang };
    }
    return this.carBrandRep.findAll({
      include: [includeOptions],
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
