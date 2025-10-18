import { AuditLogService } from './../audit_log/audit_log.service';
import { S3Service } from './../s3/s3.service';
import { GiftCategoryService } from './../gift_category/gift_category.service';
import {BadRequestException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { GiftTemplate } from './entities/gift_template.entity';
import { CreateGiftTemplateDto } from './dto/create-gift-template.dto';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { UpdateGiftTemplateDto } from './dto/update-gift-template.dto';
import { Op, Sequelize } from 'sequelize';
import { validateDates } from 'src/common/validators/date.validator';
import { validateCreateDates } from 'src/common/validators/create-date.validator';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { normalizeDatesForAudit } from 'src/common/utils/normalizeDateForAduit';

@Injectable()
export class GiftTemplateService {
  constructor(
    @Inject(repositories.gift_template_repository)
    private giftTemplateRepo: typeof GiftTemplate,
    private readonly s3Service: S3Service,
    private readonly giftCategoryService: GiftCategoryService,
    private readonly i18n: I18nService,
    private readonly auditLogService:AuditLogService
  ) {}

  async create(body: CreateGiftTemplateDto,actor:ActorInfo, file: Express.Multer.File, lang : Language) 
  {
    const { categoryId, startDate: startInput, endDate: endInput } = body;

    if (!file) {
        throw new BadRequestException(this.i18n.translate('translation.file_required', { lang }));
    }

    await this.giftCategoryService.checkIfCategoryFound(+categoryId, lang);

    const { startDate, endDate } = validateCreateDates({
        start: startInput,
        end: endInput,
        i18n: this.i18n,
        lang,
    });

    const uploadResult = await this.s3Service.uploadImage(file);

    const giftTemplate = await this.giftTemplateRepo.create({
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
        categoryId: +categoryId,
        startDate,
        endDate,
    });
    const newEntity = normalizeDatesForAudit(giftTemplate.get({ plain: true }));
    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.GIFTTEMPLATE,
      action: AuditLogAction.CREATE,
      newEntity,
      fieldsToExclude: ['createdAt', 'updatedAt','imagePublicId'],
    });
    return { message: this.i18n.translate('translation.gift_template.created', { lang }) };
  }

  async update(body: UpdateGiftTemplateDto,actor:ActorInfo,templateId: number,lang:Language,file?: Express.Multer.File
  ) {
    const giftTemplate = await this.giftTemplateRepo.findByPk(templateId);
    if (!giftTemplate) {
      throw new BadRequestException(
        this.i18n.translate('translation.gift_template.not_found', { lang })
      );
    }
    const oldEntity = normalizeDatesForAudit(giftTemplate.get({ plain: true }));

    const { categoryId, startDate: newStart, endDate: newEnd } = body;
    if (categoryId !== undefined) {
      await this.giftCategoryService.checkIfCategoryFound(+categoryId, lang);
      giftTemplate.categoryId = +categoryId;
    }
    if (file) {
      if (giftTemplate.imagePublicId) {
        await this.s3Service.deleteImage(giftTemplate.imagePublicId);
      }
      const uploadResult = await this.s3Service.uploadImage(file);
      giftTemplate.imageUrl = uploadResult.secure_url;
      giftTemplate.imagePublicId = uploadResult.public_id;
    }

    const { startDate, endDate } = validateDates({
      existingStart: giftTemplate.startDate,
      existingEnd: giftTemplate.endDate,
      newStart,
      newEnd,
      i18n: this.i18n,
      lang,
    });

    await giftTemplate.update({ ...body, startDate, endDate,...(file ? { imageUrl: giftTemplate.imageUrl, imagePublicId: giftTemplate.imagePublicId } : {}), });
    const updatedGiftTemplate = await giftTemplate.reload();
    const newEntity = normalizeDatesForAudit(updatedGiftTemplate.get({ plain: true }));
    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.GIFTTEMPLATE,
      action: AuditLogAction.UPDATE,
      oldEntity,
      newEntity,
      fieldsToExclude: ['createdAt', 'updatedAt','imagePublicId'],
    });

    return {
      message: this.i18n.translate('translation.gift_template.updated', { lang }),
    };
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

  async findById(id: number, lang : Language) 
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