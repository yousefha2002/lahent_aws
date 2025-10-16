import { AuditLogService } from './../audit_log/audit_log.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { SubType } from './entities/subtype.entity';
import { SubTypeLanguage } from './entities/sybtype_language.entity';
import { CreateSubTypeDto } from './dto/create-subType.dto';
import { TypeService } from '../type/type.service';
import { Language } from 'src/common/enums/language';
import { UpdateSubTypeDto } from './dto/update-subType.dto';
import { I18nService } from 'nestjs-i18n';
import { StoreService } from '../store/services/store.service';

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
  ) {}

  async createSubType(dto: CreateSubTypeDto) {
    await this.typeService.findById(dto.typeId);
    const subTypeCreated = await this.subTypeRepo.create({
      typeId: dto.typeId,
    });
    await Promise.all([
      this.createSubTypeLang(dto.nameEn, Language.en, subTypeCreated.id),
      this.createSubTypeLang(dto.nameAr, Language.ar, subTypeCreated.id),
    ]);
    return { message: 'sub type created' };
  }

  async createSubTypeLang(
    name: string,
    languageCode: string,
    subTypeId: number,
  ) {
    await this.subTypelangRepo.create({ name, languageCode, subTypeId });
  }

  async updateSubType(subTypeId: number, dto: UpdateSubTypeDto) {
    await this.subTypeById(subTypeId);
    await Promise.all([
      this.updateSubTypeLanguageName(subTypeId, Language.en, dto.nameEn),
      this.updateSubTypeLanguageName(subTypeId, Language.ar, dto.nameAr),
    ]);
    return { message: 'sub type updated' };
  }

  async updateSubTypeLanguageName(
    subTypeId: number,
    languageCode: string,
    newName: string,
  ) {
    const subTypeLang = await this.subTypelangRepo.findOne({
      where: { subTypeId, languageCode },
    });

    if (!subTypeLang) {
      throw new BadRequestException('SubType language entry not found');
    }

    subTypeLang.name = newName;
    await subTypeLang.save();

    return { message: 'SubType name updated successfully' };
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

  async deleteSubType(id: number, lang = Language.en) {
    const type = await this.subTypeRepo.findByPk(id);
    if (!type) {
      const message = this.i18n.translate('translation.type_not_found', {
        lang,
      });
      throw new NotFoundException(message);
    }

    const subTypeCount = await this.storeService.countStoreBySubTypeId(id);
    if (subTypeCount > 0) {
      const message = this.i18n.translate('translation.type_has_stores', {
        lang,
      });
      throw new BadRequestException(message);
    }

    await this.subTypeRepo.destroy({ where: { id } });

    const message = this.i18n.translate('translation.deletedSuccefully', {
      lang, // تمرير اللغة يدويًا
    });
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
