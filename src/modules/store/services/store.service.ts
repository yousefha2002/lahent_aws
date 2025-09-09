import { SectorService } from './../../sector/sector.service';
import { FaviroteService } from './../../favirote/favirote.service';
import { StoreUtilsService } from './storeUtils.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { OpeningHourService } from '../../opening_hour/opening_hour.service';
import { StoreStatus } from 'src/common/enums/store_status';
import { OpeningHour } from '../../opening_hour/entites/opening_hour.entity';
import { Type } from '../../type/entities/type.entity';
import { TypeLanguage } from '../../type/entities/type_language.entity';
import { Language } from 'src/common/enums/language';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { SubType } from '../../subtype/entities/subtype.entity';
import { SubTypeLanguage } from '../../subtype/entities/sybtype_language.entity';
import { getDayOfWeek } from 'src/common/utils/getDayOfWeek';
import { Op, Sequelize } from 'sequelize';
import { I18nService } from 'nestjs-i18n';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { StoreLanguage } from '../entities/store_language.entity';
import { SubtypeService } from 'src/modules/subtype/subtype.service';
import { Sector } from 'src/modules/sector/entities/sector.entity';
import { SectorLanguage } from 'src/modules/sector/entities/sectore_langauge.entity';

@Injectable()
export class StoreService {
  constructor(
    @Inject(repositories.store_repository)
    private storeRepo: typeof Store,
    private readonly cloudinaryService: CloudinaryService,
    private readonly openingHourService: OpeningHourService,
    private readonly storeUtilsService: StoreUtilsService,
    @Inject(repositories.store_langauge_repository) private storeLanguageRepo: typeof StoreLanguage,
    private readonly i18n: I18nService,
    private subTypeService: SubtypeService,
    @Inject(forwardRef(() => FaviroteService)) private faviroteService: FaviroteService,
    private sectorService:SectorService
  ) {}

  async findAllStores(
    lang:Language,
    page = 1,
    limit = 10,
    typeId?: number,
    subTypeId?: number,
    name?: string,
    lat?:number,
    lng?:number
  ) {
    const offset = (page - 1) * limit;
    const attributes: any = { include: [] };

    let order: any = [['id', 'DESC']];

    if (lat && lng) {
      const distanceLiteral = Sequelize.literal(`
        ST_Distance_Sphere(
          point(Store.lng, Store.lat),
          point(${lng}, ${lat})
        )
      `);
      attributes.include.push([distanceLiteral, 'distance']);
      order = [[distanceLiteral, 'ASC']];
    }
  
    const { rows, count } = await this.storeRepo.findAndCountAll({
      where: {
        status: StoreStatus.APPROVED,
        ...(subTypeId && { subTypeId }),
      },
      include: [
        {
          model: StoreLanguage,
          where: { languageCode: lang ,...(name && {
          name: {
            [Op.like]: `%${name}%`,
          },
        })},
        },
        {
          model: SubType,
          ...(typeId && { where: { typeId } }),
          include: [
            { model: SubTypeLanguage,where: { languageCode: lang } },
            { model: Type, include: [{model:TypeLanguage,where: { languageCode: lang }}] },
          ],
        },
        { model: OpeningHour },
      ],
      offset,
      limit,
      distinct: true,
      col: 'id',
      order
    });

    const stores = rows.map((store) =>this.storeUtilsService.mapStoreWithExtras(store));
    return {
      stores,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
  }

  async findStoresByOwner(ownerId: number, lang: Language = Language.en) {
    const stores = await this.storeRepo.findAll({
      where: {
        ownerId,
      },
      include: [
        {
          model: StoreLanguage,
          where: { languageCode: lang },
          required: false
        },
        {
          model: SubType,
          include: [
            { model: SubTypeLanguage,where:{languageCode:lang} },
            { model: Type, include: [{model:TypeLanguage,where:{languageCode:lang}}] },
          ],
        },
        { model: OpeningHour },
      ],
      order: [['id', 'DESC']],
    });

    return stores.map((store) =>
      this.storeUtilsService.mapStoreWithExtras(store),
    );
  }

  async getStoreDetailsForAction(storeId: number,lang:Language)
  {
    const store = await this.storeRepo.findOne({
      where: {
        id: storeId,
      },
      include: [
        {
          model: StoreLanguage,
        },
        {model:Sector,include:[{model:SectorLanguage,where:{languageCode:lang}}]},
        {
          model: SubType,
          include: [
            { model: SubTypeLanguage,where:{languageCode:lang}},
            { model: Type, include: [{model:TypeLanguage,where:{languageCode:lang}}] },
          ],
        },
        { model: OpeningHour },
      ],
    });
    return store
  }

  async getFullDetailsStore(storeId: number, lang: Language,customerId?:number) {
    const store = await this.storeRepo.findOne({
      where: {
        id: storeId,
        status: StoreStatus.APPROVED,
      },
      include: [
        {
          model: StoreLanguage,
          where: { languageCode: lang },
        },
        {
          model: SubType,
          include: [
            { model: SubTypeLanguage,where:{languageCode:lang} },
            { model: Type, include: [{model:TypeLanguage,where:{languageCode:lang}}] },
          ],
        },
        { model: OpeningHour },
      ],
    });

    if (!store) {
      throw new NotFoundException(
        this.i18n.t('translation.store.not_found_or_not_approved'),
      );
    }
    if(customerId)
    {
      let isFavorite = false
      const favorite = await this.faviroteService.findFavoriteStore(storeId,customerId)
      isFavorite = favorite ? true : false
      const storeResponce = await this.storeUtilsService.mapStoreWithExtras(store);
      return {store:storeResponce,isFavorite}
    }
    return store
  }

  async changeStoreStatus(status: StoreStatus, storeId: number,lang = Language.en) {
    const store = await this.storeById(storeId);
    if (!store) {
      throw new BadRequestException(this.i18n.t('translation.store.not_found',{lang}));
    }
    store.status = status;
    await store.save();
    return {storeId:store.id, message: this.i18n.t('translation.store.status_updated',{lang}) };
  }

  async storeById(id: string | number) {
    return this.storeRepo.findByPk(id);
  }

  countStoreBySubTypeId(subTypeId: number) {
    return this.storeRepo.count({ where: { subTypeId } });
  }

  async updateStore(store: Store, dto: UpdateStoreDto,lang = Language.en) {
    if (dto.phone && dto.phone !== store.phone) {
      const existingStore = await this.storeRepo.findOne({
        where: { phone: dto.phone },
      });
      if (existingStore) {
        throw new BadRequestException(this.i18n.t('translation.store.phone_in_use',{lang}));
      }
    }
    if(dto.subType!==undefined)
    {
      await this.subTypeService.subTypeById(+dto.subType)
    }
    if(dto.sector!==undefined)
    {
      await this.sectorService.findOne(+dto.sector)
    }
      
    Object.assign(store, {
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.in_store !== undefined && { in_store: dto.in_store }),
      ...(dto.drive_thru !== undefined && { drive_thru: dto.drive_thru }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.commercialRegister !== undefined && {commercialRegister: dto.commercialRegister}),
      ...(dto.taxNumber !== undefined && { taxNumber: dto.taxNumber }),
      ...(dto.lat !== undefined && { lat: dto.lat }),
      ...(dto.lng !== undefined && { lng: dto.lng }),
      ...(dto.subType !== undefined && { subTypeId: dto.subType }),
      ...(dto.sector !== undefined && { sectorId: dto.sector })
    });
    await store.save();
    if (dto.openingHours && dto.openingHours.length > 0) {
      await this.openingHourService.updateStoreOpeningHours(
        store.id,
        dto.openingHours,
      );
    }

    if (dto.languages) {
    for (const t of dto.languages) {
      const existing = await this.storeLanguageRepo.findOne({
        where: { storeId: store.id, languageCode: t.languageCode },
      });
      if (existing) {
        existing.name = t.name;
        await existing.save();
      } else {
        await this.storeLanguageRepo.create({
          storeId: store.id,
          languageCode: t.languageCode,
          name: t.name,
          ...(t.brand ? { brand: t.brand } : {})
        });
      }
    }
  }

    return { message: this.i18n.t('translation.store.updated_successfully',{lang}) };
  }

  async updateStoreImages(
    store: Store,
    logo?: Express.Multer.File,
    cover?: Express.Multer.File,
    lang = Language.en
  ) {
    if (!logo && !cover) {
      return {
        message: this.i18n.t('translation.store.no_image_changes',{lang}),
        logoUrl: store.logoUrl,
        coverUrl: store.coverUrl,
      };
    }

    if (logo) {
      await this.cloudinaryService.deleteImage(store.logoPublicId);
      const uploaded = await this.cloudinaryService.uploadImage(logo);
      store.logoUrl = uploaded.secure_url;
      store.logoPublicId = uploaded.public_id;
    }

    if (cover) {
      await this.cloudinaryService.deleteImage(store.coverPublicId);
      const uploaded = await this.cloudinaryService.uploadImage(cover);
      store.coverUrl = uploaded.secure_url;
      store.coverPublicId = uploaded.public_id;
    }

    await store.save();

    return {
      message: this.i18n.t('translation.store.images_updated'),
      logoUrl: store.logoUrl,
      coverUrl: store.coverUrl,
    };
  }

  async isStoreOpenAt(storeId: number, date: Date): Promise<boolean> {
    const dayEnum = getDayOfWeek(date);

    const openingHours: OpeningHour[] =
      await this.openingHourService.getOpeningHoursByStoreId(storeId);
    const todayOpening = openingHours.find((hour) => hour.day === dayEnum);

    if (!todayOpening) return false;

    if (!todayOpening.openTime || !todayOpening.closeTime) return false;

    const openTimeParts = todayOpening.openTime.split(':');
    const closeTimeParts = todayOpening.closeTime.split(':');

    const openDate = new Date(date);
    openDate.setHours(
      parseInt(openTimeParts[0]),
      parseInt(openTimeParts[1]),
      0,
      0,
    );

    const closeDate = new Date(date);
    closeDate.setHours(
      parseInt(closeTimeParts[0]),
      parseInt(closeTimeParts[1]),
      0,
      0,
    );

    // معالجة حالة الإغلاق بعد منتصف الليل
    if (closeDate <= openDate) {
      // إذا وقت الإغلاق أقل أو يساوي وقت الفتح => يعني الإغلاق في اليوم التالي
      closeDate.setDate(closeDate.getDate() + 1);
    }

    return date >= openDate && date <= closeDate;
  }

  async getFavouriteStoresByCustomer(customerId: number, lang: Language = Language.en,page:number,limit:number,type?:number)
  {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.storeRepo.findAndCountAll({
      where: {status: StoreStatus.APPROVED,},
      include: [
        {model:StoreLanguage,where:{languageCode:lang}},
        {
          model: SubType,
          ...(type && { where: { typeId:type } }),
          include: [
            { model: SubTypeLanguage,where:{languageCode:lang} },
            { model: Type, include: [{model:TypeLanguage,where:{languageCode:lang}}] },
          ],
        },
        { model: OpeningHour },
        {
          model: Customer,
          through: { attributes: [] },
          where: { id: customerId },
          required: true
        }
      ],
      offset,
      limit,
      distinct: true,
      order: [['id', 'DESC']],
    });

    const stores = rows.map((store) =>this.storeUtilsService.mapStoreWithExtras(store));
    return {
      stores,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
  }

  async getStoreServiceOptions(storeId: number) 
  {
    const store = await this.storeRepo.findByPk(storeId, {
      attributes: ['id', 'drive_thru', 'in_store'], 
      include: [
        {
          association: 'openingHours', // اسم العلاقة
          attributes: ['id', 'day', 'openTime', 'closeTime'],
        },
      ],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }
}