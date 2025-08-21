import { StoreService } from 'src/modules/store/services/store.service';
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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TypeLanguage } from './entities/type_language.entity';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';
import { SubtypeService } from '../subtype/subtype.service';

@Injectable()
export class TypeService {
  constructor(
    @Inject(repositories.type_repository) private typeRepo: typeof Type,
    @Inject(repositories.typeLanguage_repository)
    private typeLangRepo: typeof TypeLanguage,
    @Inject(forwardRef(() => StoreService)) private storeService: StoreService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => SubtypeService))
    private subTypeService: SubtypeService,
  ) {}

  async createType(
    dto: CreateTypeDto,
    file: Express.Multer.File,
    lang: string,
  ) {
    const [] = await Promise.all([
      this.checkTypeLanguage(dto.nameEn, lang),
      this.checkTypeLanguage(dto.nameAr, lang),
    ]);
    const result = await this.cloudinaryService.uploadImage(file);
    const createdData = {
      iconUrl: result.secure_url,
      iconPublicId: result.public_id,
    };
    const typeCreated = await this.typeRepo.create({ ...createdData });
    await Promise.all([
      this.createTypeLang(dto.nameEn, Language.en, typeCreated.id),
      this.createTypeLang(dto.nameAr, Language.ar, typeCreated.id),
    ]);
    const message = this.i18n.translate('translation.createdSuccefully', {
      lang, // تمرير اللغة يدويًا
    });
    return { message };
  }

  async checkTypeLanguage(name: string, lang: string) {
    const typeLang = await this.typeLangRepo.findOne({ where: { name } });
    if (typeLang) {
      const message = this.i18n.translate('translation.find_type_message', {
        lang,
      });
      throw new BadRequestException(message);
    }
  }

  async createTypeLang(name: string, languageCode: string, typeId: number) {
    await this.typeLangRepo.create({ name, languageCode, typeId });
  }

  async updateType(
    id: number,
    dto: CreateTypeDto,
    lang: string,
    file?: Express.Multer.File,
  ) {
    const type = await this.typeRepo.findByPk(id);
    if (!type) throw new NotFoundException(`Type with id ${id} not found`);

    // Check for duplicate names (excluding current type)
    await this.ensureUniqueName(dto.nameEn, id, lang);
    await this.ensureUniqueName(dto.nameAr, id, lang);

    // Replace image if file is provided
    if (file) {
      if (type.iconPublicId) {
        await this.cloudinaryService.deleteImage(type.iconPublicId);
      }
      const result = await this.cloudinaryService.uploadImage(file);
      type.iconUrl = result.secure_url;
      type.iconPublicId = result.public_id;
    }

    await type.save();

    // Update language records
    await Promise.all([
      await this.updateLanguageName(id, Language.en, dto.nameEn),
      await this.updateLanguageName(id, Language.ar, dto.nameAr),
    ]);

    const message = this.i18n.translate('translation.updatedSuccefully', {
      lang, // تمرير اللغة يدويًا
    });
    return { message };
  }

  private async ensureUniqueName(
    name: string,
    currentTypeId: number,
    lang: string,
  ) {
    const existing = await this.typeLangRepo.findOne({ where: { name } });
    if (existing && existing.typeId !== currentTypeId) {
      const message = this.i18n.translate('translation.find_type_message', {
        lang, // تمرير اللغة يدويًا
      });
      throw new BadRequestException(message);
    }
  }

  private async updateLanguageName(
    typeId: number,
    lang: Language,
    newName: string,
  ) {
    const record = await this.typeLangRepo.findOne({
      where: { typeId, languageCode: lang },
    });
    if (record) {
      record.name = newName;
      await record.save();
    }
  }

  // if needed but not recommended
  async deleteType(id: number, lang = Language.en) {
    const type = await this.typeRepo.findByPk(id);
    if (!type) {
      const message = this.i18n.translate('translation.type_not_found', {
        lang,
      });
      throw new NotFoundException(message);
    }

    const subTypeCount = await this.subTypeService.countSubTypeByTypeId(id);
    if (subTypeCount > 0) {
      const message = this.i18n.translate('translation.type_has_subtypes', {
        lang,
      });
      throw new BadRequestException(message);
    }

    await this.cloudinaryService.deleteImage(type.iconPublicId);

    await this.typeRepo.destroy({ where: { id } });

    const message = this.i18n.translate('translation.deletedSuccefully', {
      lang, // تمرير اللغة يدويًا
    });
    return { message };
  }

  async getAllTypes(language: Language) {
    const types = await this.typeRepo.findAll({
      include: [
        {
          model: this.typeLangRepo,
          where: { languageCode: language },
        },
      ],
    });

    return types;
  }

  async getOneType(typeId: number, language: Language) {
    const type = await this.typeRepo.findOne({
      where: { id: typeId },
      include: [
        {
          model: this.typeLangRepo,
          where: { languageCode: language },
        },
      ],
    });

    if (!type) {
      throw new BadRequestException('Invalid type');
    }
    return type;
  }

  async findById(id: string | number) {
    const type = await this.typeRepo.findByPk(id);
    if (!type) {
      throw new BadRequestException('Invalid type');
    }
    return type;
  }
}
