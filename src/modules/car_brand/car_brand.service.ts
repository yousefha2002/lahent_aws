import { AuditLogService } from './../audit_log/audit_log.service';
import {BadRequestException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CarBrand } from './entities/car_brand.entity';
import { UpdateCarBrandDto } from './dto/update_car_brand.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { CarBrandLanguage } from './entities/car_brand.languae.entity';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { buildMultiLangEntity } from 'src/common/utils/buildMultiLangEntity';
import { validateRequiredLanguages, validateUniqueLanguages } from 'src/common/validators/translation-validator.';
import { Sequelize } from 'sequelize';

@Injectable()
export class CarBrandService {
  constructor(
    @Inject(repositories.car_brand_repository)
    private carBrandRep: typeof CarBrand,
    @Inject(repositories.car_brand_langauge_repository)
    private carBrandLanguageRep: typeof CarBrandLanguage,
    private readonly auditLogService:AuditLogService,
    private readonly i18n: I18nService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {}

  async create(dto: UpdateCarBrandDto, actor: ActorInfo, lang: Language) {
    const transaction = await this.sequelize.transaction();

    try {
      const codes = dto.languages.map(l => l.languageCode);
      validateRequiredLanguages(codes, 'car brand languages');

      for (const langObj of dto.languages) {
        const exists = await this.carBrandLanguageRep.findOne({
          where: { name: langObj.name, languageCode: langObj.languageCode },
        });
        if (exists) {
          const message = this.i18n.translate('translation.name_exists', { lang });
          throw new BadRequestException(message);
        }
      }

      const brand = await this.carBrandRep.create({}, { transaction });

      for (const langObj of dto.languages) {
        await this.carBrandLanguageRep.create(
          {
            carBrandId: brand.id,
            languageCode: langObj.languageCode,
            name: langObj.name,
          },
          { transaction },
        );
      }

      const newEntity = buildMultiLangEntity(dto.languages, ['name']);

      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.CARBRAND,
        action: AuditLogAction.CREATE,
        entityId: brand.id,
        newEntity,
        fieldsToExclude: [],
      });

      await transaction.commit();

      const message = this.i18n.translate('translation.createdSuccefully', { lang });
      return { message };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id: number, actor: ActorInfo, dto: UpdateCarBrandDto, lang: Language) 
  {
    const brand = await this.getOneOrFail(id);

    const oldLanguages = await this.carBrandLanguageRep.findAll({where: { carBrandId: id }});
    const oldTranslationEntity = buildMultiLangEntity(oldLanguages, ['name']);


    if (dto.languages) {
      const codes = dto.languages.map(l => l.languageCode);
      validateUniqueLanguages(codes, 'car brand languages');

      for (const langObj of dto.languages) {
        const exists = await this.carBrandLanguageRep.findOne({
          where: { name: langObj.name, languageCode: langObj.languageCode },
        });
        if (exists && exists.carBrandId !== id) {
          const message = this.i18n.translate('translation.name_exists', { lang });
          throw new BadRequestException(message);
        }

        const existingLang = await this.carBrandLanguageRep.findOne({
          where: { carBrandId: id, languageCode: langObj.languageCode },
        });

        if (existingLang) {
          existingLang.name = langObj.name;
          await existingLang.save();
        } else {
          await this.carBrandLanguageRep.create({
            carBrandId: id,
            languageCode: langObj.languageCode,
            name: langObj.name,
          });
        }
      }
    }

    const newLanguages = await this.carBrandLanguageRep.findAll({where: { carBrandId: id },});
    const newTranslationEntity = buildMultiLangEntity(newLanguages, ['name']);

    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.CARBRAND,
      action: AuditLogAction.UPDATE,
      entityId: brand.id,
      oldEntity:oldTranslationEntity,
      newEntity:newTranslationEntity,
      fieldsToExclude: [],
    });

    const message = this.i18n.translate('translation.updatedSuccefully', { lang });
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
