import { GiftCategoryService } from './../gift_category/gift_category.service';
import { CloudinaryService } from './../../cloudinary/cloudinary.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { GiftTemplate } from './entities/gift_template.entity';
import { CreateGiftTemplateDto } from './dto/create-gift-template.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class GiftTemplateService {
  constructor(
    @Inject(repositories.gift_template_repository)
    private giftTemplateRepo: typeof GiftTemplate,
    private readonly cloudinaryService: CloudinaryService,
    private readonly giftCategoryService: GiftCategoryService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    body: CreateGiftTemplateDto,
    file: Express.Multer.File,
    lang = Language.en,
  ) {
    const { categoryId } = body;
    if (!file) {
      const msg = this.i18n.translate('translation.file_required', { lang });
      throw new BadRequestException(msg);
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file);
    await this.giftCategoryService.checkIfCategoryFound(+categoryId, lang);

    const giftTemplate = await this.giftTemplateRepo.create({
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      categoryId,
    });

    const msg = this.i18n.translate('translation.gift_template.created', {
      lang,
    });
    return { message: msg };
  }

  async update(
    body: CreateGiftTemplateDto,
    templateId: number,
    lang = Language.en,
    file: Express.Multer.File,
  ) {
    const giftTemplate = await this.giftTemplateRepo.findByPk(templateId);
    if (!giftTemplate) {
      const msg = this.i18n.translate('translation.gift_template.not_found', {
        lang,
      });
      throw new BadRequestException(msg);
    }

    const { categoryId } = body;
    await this.giftCategoryService.checkIfCategoryFound(+categoryId, lang);

    if (file) {
      if (giftTemplate.imagePublicId) {
        await this.cloudinaryService.deleteImage(giftTemplate.imagePublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      giftTemplate.imageUrl = uploadResult.secure_url;
      giftTemplate.imagePublicId = uploadResult.public_id;
    }

    giftTemplate.categoryId = +categoryId;
    await giftTemplate.save();

    const msg = this.i18n.translate('translation.gift_template.updated', {
      lang,
    });
    return { message: msg };
  }

  async findByCategoryWithPagination(categoryId: number, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.giftTemplateRepo.findAndCountAll({
      where: { categoryId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return {
      data: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: number, lang = Language.en) {
    const giftTemplate = await this.giftTemplateRepo.findByPk(id);
    if (!giftTemplate) {
      const msg = this.i18n.translate('translation.gift_template.invalid', {
        lang,
      });
      throw new NotFoundException(msg);
    }
    return giftTemplate;
  }
}
