import { GiftCategoryService } from './../gift_category/gift_category.service';
import { CloudinaryService } from './../../cloudinary/cloudinary.service';
import {BadRequestException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { GiftTemplate } from './entities/gift_template.entity';
import { CreateGiftTemplateDto } from './dto/create-gift-template.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { UpdateGiftTemplateDto } from './dto/update-gift-template.dto';
import { Op } from 'sequelize';

@Injectable()
export class GiftTemplateService {
  constructor(
    @Inject(repositories.gift_template_repository)
    private giftTemplateRepo: typeof GiftTemplate,
    private readonly cloudinaryService: CloudinaryService,
    private readonly giftCategoryService: GiftCategoryService,
    private readonly i18n: I18nService,
  ) {}

  async create(body: CreateGiftTemplateDto,file: Express.Multer.File,lang = Language.ar)
  {
    const { categoryId, startDate, endDate } = body;

    if (!file) {
      const msg = this.i18n.translate('translation.file_required', { lang });
      throw new BadRequestException(msg);
    }

    await this.giftCategoryService.checkIfCategoryFound(+categoryId, lang);

    let start: Date = startDate ? new Date(startDate) : new Date();
    if (startDate) {
      start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        throw new BadRequestException(this.i18n.translate('translation.start_in_past', { lang }));
      }
    }

    let end: Date | null = null;
    if (endDate) {
      end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (end < today) {
        throw new BadRequestException(this.i18n.translate('translation.expired_date', { lang }));
      }
      if (start && end < start) {
        throw new BadRequestException(this.i18n.translate('translation.invalid_dates', { lang }));
      }
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file);

    const giftTemplate = await this.giftTemplateRepo.create({
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      categoryId: +categoryId,
      startDate: start,
      endDate: end,
    });

    const msg = this.i18n.translate('translation.gift_template.created', { lang });
    return { message: msg };
  }

  async update(body: UpdateGiftTemplateDto,templateId: number,lang = Language.ar,file?: Express.Multer.File) 
  {
    const giftTemplate = await this.giftTemplateRepo.findByPk(templateId);
    if (!giftTemplate) {
      const msg = this.i18n.translate('translation.gift_template.not_found', { lang });
      throw new BadRequestException(msg);
    }

    const { categoryId, startDate, endDate } = body;

    if (categoryId !== undefined) {
      await this.giftCategoryService.checkIfCategoryFound(+categoryId, lang);
      giftTemplate.categoryId = +categoryId;
    }

    if (file) {
      if (giftTemplate.imagePublicId) {
        await this.cloudinaryService.deleteImage(giftTemplate.imagePublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      giftTemplate.imageUrl = uploadResult.secure_url;
      giftTemplate.imagePublicId = uploadResult.public_id;
    }

    if (startDate !== undefined) {
      if (startDate === null || startDate === 'null' || startDate === '') {
        giftTemplate.startDate = new Date();
      } else {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          throw new BadRequestException(this.i18n.translate('translation.invalid_dates', { lang }));
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
          throw new BadRequestException(this.i18n.translate('translation.start_in_past', { lang }));
        }
        giftTemplate.startDate = start;
      }
    }

    if (endDate !== undefined) {
      if (endDate === null || endDate === 'null' || endDate === '') {
        giftTemplate.endDate = null;
      } else {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          throw new BadRequestException(this.i18n.translate('translation.invalid_dates', { lang }));
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (end < today) {
          throw new BadRequestException(this.i18n.translate('translation.expired_date', { lang }));
        }
        if (giftTemplate.startDate && end < giftTemplate.startDate) {
          throw new BadRequestException(this.i18n.translate('translation.invalid_dates', { lang }));
        }
        giftTemplate.endDate = end;
      }
    }

    await giftTemplate.save();

    const msg = this.i18n.translate('translation.gift_template.updated', { lang });
    return { message: msg };
  }

  async findByCategoryWithPagination(categoryId: number,page = 1,limit = 10,onlyActive = true) 
  {
    const offset = (page - 1) * limit;
    const where: any = { categoryId };
    if (onlyActive) {
      const today = new Date();
      where.startDate = { [Op.lte]: today };
      where[Op.or] = [
        { endDate: null },
        { endDate: { [Op.gte]: today } },
      ];
    }

    const { rows, count } = await this.giftTemplateRepo.findAndCountAll({
      where,
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

  async findById(id: number, lang = Language.ar) 
  {
    const giftTemplate = await this.giftTemplateRepo.findOne({
      where: {
        id,
        startDate: { [Op.lte]: new Date() },
        [Op.or]: [
          { endDate: null },               
          { endDate: { [Op.gte]: new Date() } },
        ],
      },
    });

    if (!giftTemplate) {
      const msg = this.i18n.translate('translation.gift_template.invalid', {
        lang,
      });
      throw new NotFoundException(msg);
    }

    return giftTemplate;
  }
}