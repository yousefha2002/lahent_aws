import { AuditLogService } from './../audit_log/audit_log.service';
import { S3Service } from './../s3/s3.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Type } from './entities/type.entity';
import { CreateTypeDto } from './dto/create-type.dto';
import { TypeLanguage } from './entities/type_language.entity';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { SubtypeService } from '../subtype/subtype.service';
import { ActorInfo } from 'src/common/types/current-user.type';
import { Sequelize } from 'sequelize';
import { buildMultiLangEntity } from 'src/common/utils/buildMultiLangEntity';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { validateAndParseTypeTranslations } from 'src/common/validators/validate-type-translations.validator';

@Injectable()
export class TypeService {
  constructor(
    @Inject(repositories.type_repository) private typeRepo: typeof Type,
    @Inject(repositories.typeLanguage_repository)
    private typeLangRepo: typeof TypeLanguage,
    private readonly s3Service: S3Service,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => SubtypeService))
    private subTypeService: SubtypeService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly auditLogService:AuditLogService
  ) {}

  async createType(dto: CreateTypeDto, actor: ActorInfo, file: Express.Multer.File, lang: Language) {
    const transaction = await this.sequelize.transaction();

    try {
        const translations = validateAndParseTypeTranslations(dto.languages);

        let createdData: any = {};
        const result = await this.s3Service.uploadImage(file);
        createdData = { iconUrl: result.secure_url, iconPublicId: result.public_id };
        const typeCreated = await this.typeRepo.create({ ...createdData }, { transaction });
        for (const langObj of translations) {
            await this.typeLangRepo.create({
                typeId: typeCreated.id,
                languageCode: langObj.languageCode,
                name: langObj.name,
            }, { transaction });
        }

        const newLanguages = await this.typeLangRepo.findAll({
            where: { typeId: typeCreated.id },
            transaction,
        });
        const newEntity = buildMultiLangEntity(newLanguages, ['name']);
        if (file) {
            newEntity.iconUrl = createdData.iconUrl;
        }

        await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.TYPE,
            action: AuditLogAction.CREATE,
            entityId: typeCreated.id,
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

  async updateType(id: number,dto: CreateTypeDto,actor: ActorInfo,lang: Language,file?: Express.Multer.File) 
  {
    const transaction = await this.sequelize.transaction();

    try {
      const type = await this.typeRepo.findByPk(id, { transaction });
      if (!type) {
        const message = this.i18n.translate('translation.type_not_found', { lang });
        throw new NotFoundException(message);
      }

      const translations = validateAndParseTypeTranslations(dto.languages);

      const oldLanguages = await this.typeLangRepo.findAll({ where: { typeId: id }, transaction });
      const oldEntity = buildMultiLangEntity(oldLanguages, ['name']);
      if (type.iconUrl) {
        oldEntity.iconUrl = type.iconUrl;
      }

      if (file) {
        if (type.iconPublicId) {
          await this.s3Service.deleteImage(type.iconPublicId);
        }
        const result = await this.s3Service.uploadImage(file);
        type.iconUrl = result.secure_url;
        type.iconPublicId = result.public_id;
      }
      await type.save({ transaction });

      for (const langObj of translations) {
        const existingLang = await this.typeLangRepo.findOne({
          where: { typeId: id, languageCode: langObj.languageCode },
          transaction,
        });

        if (existingLang) {
          existingLang.name = langObj.name;
          await existingLang.save({ transaction });
        } else {
          await this.typeLangRepo.create({
            typeId: id,
            languageCode: langObj.languageCode,
            name: langObj.name,
          }, { transaction });
        }
      }

      const newLanguages = await this.typeLangRepo.findAll({ where: { typeId: id }, transaction });
      const newEntity = buildMultiLangEntity(newLanguages, ['name']);
      if (file) {
        newEntity.iconUrl = type.iconUrl;
      }

      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.TYPE,
        action: AuditLogAction.UPDATE,
        entityId: id,
        oldEntity,
        newEntity,
        fieldsToExclude: [],
      });

      await transaction.commit();

      const message = this.i18n.translate('translation.updatedSuccefully', { lang });
      return { message };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteType(id: number, actor: ActorInfo, lang: Language = Language.en) 
  {
    const type = await this.typeRepo.findByPk(id);
    if (!type) {
      const message = this.i18n.translate('translation.type_not_found', { lang });
      throw new NotFoundException(message);
    }

    const subTypeCount = await this.subTypeService.countSubTypeByTypeId(id);
    if (subTypeCount > 0) {
      const message = this.i18n.translate('translation.type_has_subtypes', { lang });
      throw new BadRequestException(message);
    }

    const oldLanguages = await this.typeLangRepo.findAll({ where: { typeId: id } });
    const oldEntity = buildMultiLangEntity(oldLanguages, ['name']);
    if (type.iconUrl) {
      oldEntity.iconUrl = type.iconUrl;
    }

    if (type.iconPublicId) {
      await this.s3Service.deleteImage(type.iconPublicId);
    }

    await this.typeRepo.destroy({ where: { id } });

    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.TYPE,
      action: AuditLogAction.DELETE,
      entityId: id,
      oldEntity,
      newEntity: null,
      fieldsToExclude: [],
    });

    const message = this.i18n.translate('translation.deletedSuccefully', { lang });
    return { message };
  }

    async getAllTypes(language?: Language) {
      const includeOptions: any = {
        model: this.typeLangRepo,
      };

      if (language) {
        includeOptions.where = { languageCode: language };
      }
      const types = await this.typeRepo.findAll({
        include: [includeOptions],
      });

      return types;
    }

    async findById(id: string | number) {
      const type = await this.typeRepo.findByPk(id);
      if (!type) {
        throw new BadRequestException('Invalid type');
      }
      return type;
    }
}