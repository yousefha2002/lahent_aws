import { AuditLogService } from './../audit_log/audit_log.service';
import {BadRequestException,forwardRef,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { SubType } from './entities/subtype.entity';
import { SubTypeLanguage } from './entities/sybtype_language.entity';
import { CreateSubTypeDto } from './dto/create-subType.dto';
import { TypeService } from '../type/type.service';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { StoreService } from '../store/services/store.service';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { buildMultiLangEntity } from 'src/common/utils/buildMultiLangEntity';
import { ActorInfo } from 'src/common/types/current-user.type';
import { Sequelize } from 'sequelize';

@Injectable()
export class SubtypeService {
  constructor(
    @Inject(repositories.sub_type_repository)
    private subTypeRepo: typeof SubType,
    @Inject(repositories.sub_type_language_repository)
    private subTypelangRepo: typeof SubTypeLanguage,
    @Inject(forwardRef(() => TypeService)) private typeService: TypeService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => StoreService)) private storeService: StoreService,
    private readonly auditLogService:AuditLogService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {}

  async createSubType(dto: CreateSubTypeDto, actor: ActorInfo, lang: Language) 
  {
    const transaction = await this.sequelize.transaction();

    try {
        await this.typeService.findById(dto.typeId);

        const subTypeCreated = await this.subTypeRepo.create(
          { typeId: dto.typeId },
          { transaction },
        );

        for (const langObj of dto.languages) {
          await this.subTypelangRepo.create(
            {
              subTypeId: subTypeCreated.id,
              languageCode: langObj.languageCode,
              name: langObj.name,
            },
            { transaction },
          );
        }

        const newEntity = buildMultiLangEntity(dto.languages, ['name']);

        await this.auditLogService.logChange({
          actor,
          entity: AuditLogEntity.SUBTYPE,
          action: AuditLogAction.CREATE,
          entityId: subTypeCreated.id,
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

  async updateSubType(subTypeId: number, dto: CreateSubTypeDto, actor: ActorInfo, lang: Language) {
    const transaction = await this.sequelize.transaction();

    try {
      const subType = await this.subTypeById(subTypeId);

      const oldLanguages = await this.subTypelangRepo.findAll({
        where: { subTypeId },
        transaction,
      });
      const oldEntity = buildMultiLangEntity(oldLanguages, ['name']);
      oldEntity.typeId = subType.typeId; 

      if (dto.typeId && dto.typeId !== subType.typeId) {
        await this.typeService.findById(dto.typeId); 
        subType.typeId = dto.typeId;
        await subType.save({ transaction });
      }

      for (const langObj of dto.languages) {
        const existingLang = await this.subTypelangRepo.findOne({
          where: { subTypeId, languageCode: langObj.languageCode },
          transaction,
        });

        if (existingLang) {
          existingLang.name = langObj.name;
          await existingLang.save({ transaction });
        } else {
          await this.subTypelangRepo.create(
            {
              subTypeId,
              languageCode: langObj.languageCode,
              name: langObj.name,
            },
            { transaction },
          );
        }
      }

      const newLanguages = await this.subTypelangRepo.findAll({
        where: { subTypeId },
        transaction,
      });
      const newEntity = buildMultiLangEntity(newLanguages, ['name']);
      newEntity.typeId = subType.typeId;

      await this.auditLogService.logChange({
        actor,
        entity: AuditLogEntity.SUBTYPE,
        action: AuditLogAction.UPDATE,
        entityId: subTypeId,
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

  async subTypeById(subTypeById: number) {
    const subType = await this.subTypeRepo.findByPk(subTypeById);
    if (!subType) {
      throw new BadRequestException('Invalid sub type');
    }
    return subType;
  }

  countSubTypeByTypeId(typeId: number) {
    return this.subTypeRepo.count({ where: { typeId } });
  }

  async deleteSubType(id: number, actor: ActorInfo, lang: Language) 
  {
    const subType = await this.subTypeRepo.findByPk(id, {include: ['languages'],});

    if (!subType) {
      const message = this.i18n.translate('translation.type_not_found', { lang });
      throw new NotFoundException(message);
    }

    const subTypeCount = await this.storeService.countStoreBySubTypeId(id);
    if (subTypeCount > 0) {
      const message = this.i18n.translate('translation.type_has_stores', { lang });
      throw new BadRequestException(message);
    }

    const oldEntity = {
      id: subType.id,
      typeId: subType.typeId,
      translations: subType.languages?.map(lang => ({
        languageCode: lang.languageCode,
        name: lang.name,
      })) || [],
    };

    await this.subTypeRepo.destroy({ where: { id } });

    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.SUBTYPE,
      action: AuditLogAction.DELETE,
      entityId: id,
      oldEntity,
      newEntity: null,
      fieldsToExclude: [],
    });

    const message = this.i18n.translate('translation.deletedSuccefully', { lang });
    return { message };
  }

  async getAllSubTypesByTypeId(typeId: number, language?: Language) {
    const includeOptions: any = { model: this.subTypelangRepo };

    if (language) {
      includeOptions.where = { languageCode: language };
    }

    const subTypes = await this.subTypeRepo.findAll({
      where: { typeId },
      include: [includeOptions],
    });

    return subTypes;
  }
}