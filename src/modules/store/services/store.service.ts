import { SmsService } from './../../sms/sms.service';
import { StoreCommissionService } from './../../store_commission/store_commission.service';
import { SectorService } from './../../sector/sector.service';
import { FaviroteService } from './../../favirote/favirote.service';
import { StoreUtilsService } from './storeUtils.service';
import {BadRequestException,forwardRef,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { OpeningHourService } from '../../opening_hour/opening_hour.service';
import { StoreStatus } from 'src/common/enums/store_status';
import { OpeningHour } from '../../opening_hour/entites/opening_hour.entity';
import { Type } from '../../type/entities/type.entity';
import { TypeLanguage } from '../../type/entities/type_language.entity';
import { Language } from 'src/common/enums/language';
import { UpdateStoreDto } from '../dto/requests/update-store.dto';
import { SubType } from '../../subtype/entities/subtype.entity';
import { SubTypeLanguage } from '../../subtype/entities/sybtype_language.entity';
import { Op, Sequelize } from 'sequelize';
import { I18nService } from 'nestjs-i18n';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { StoreLanguage } from '../entities/store_language.entity';
import { SubtypeService } from 'src/modules/subtype/subtype.service';
import { Sector } from 'src/modules/sector/entities/sector.entity';
import { SectorLanguage } from 'src/modules/sector/entities/sectore_langauge.entity';
import { Owner } from 'src/modules/owner/entities/owner.entity';
import { StoreCommission } from 'src/modules/store_commission/entities/store_commission.entity';
import { getDateRange } from 'src/common/utils/getDateRange';
import { UpdateStoreLegalInfoDto } from '../dto/requests/update-store-legal.dto';

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
    private sectorService:SectorService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly storeCommissionService:StoreCommissionService,
    private readonly smsService:SmsService
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
        isCompletedProfile:true
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

    const mappedStores = stores.map(store =>this.storeUtilsService.mapStoreWithExtras(store));
    const hasIncompleteStore = await this.storeRepo.findOne({where:{ownerId,isCompletedProfile:false}})
    return {
        stores: mappedStores,
        hasIncompleteStore:!!hasIncompleteStore
    };
  }

  async findAllStoresForAdmin(
    lang: Language,
    page = 1,
    limit = 10,
    status?: StoreStatus,
    typeId?: number,
    subTypeId?: number,
    name?: string,
    city?: string,
    phone?: string,
    commercialRegister?: string,
    dateFilter?: string,) 
  {
    const { start, end } = getDateRange(dateFilter);
    const offset = (page - 1) * limit;
    const whereStore: any = {
      ...(status && { status }),
      ...(subTypeId && { subTypeId }),
      ...(city && { city:{ [Op.like]: `%${city}%` } }),
      ...(phone && { phone: { [Op.like]: `%${phone}%` } }),
      ...(commercialRegister && { commercialRegister: { [Op.like]: `%${commercialRegister}%` } }),
      ...(dateFilter && { createdAt: { [Op.between]: [start, end] } }),
      isCompletedProfile: true,
    };
    const include: any = [
    {
        model: StoreLanguage,
        where: {
          languageCode: lang,
          ...(name && { name: { [Op.like]: `%${name}%` } }),
        },
      },
      {
        model: SubType,
        ...(typeId && { where: { typeId } }),
        include: [
          { model: SubTypeLanguage, where: { languageCode: lang } },
          { model: Type, include: [{ model: TypeLanguage, where: { languageCode: lang } }] },
        ],
      },
      { model: OpeningHour },
    ];
    const { rows, count } = await this.storeRepo.findAndCountAll({
      where:whereStore,
      include,
      offset,
      limit,
      distinct: true,
      col: 'id',
      order: [['createdAt', 'DESC']],
    });

    const stores = rows.map((store) =>
      this.storeUtilsService.mapStoreWithExtras(store),
    );

    return {
      stores,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
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

  async getFullDetailsStoreAdmin(storeId: number, lang: Language) 
  {
    const store = await this.storeRepo.findOne({
      where: {
        id: storeId,
      },
      include: [
        {
          model: StoreLanguage,
          where: { languageCode: lang },
        },
        {
          model: SubType,
          include: [
            { model: SubTypeLanguage, where: { languageCode: lang } },
            {
              model: Type,
              include: [{ model: TypeLanguage, where: { languageCode: lang } }],
            },
          ],
        },
        {
          model: Sector,
          include: [{ model: SectorLanguage, where: { languageCode: lang } }],
        },
        { model: OpeningHour },
        { model: Owner},
        {model:StoreCommission}
      ],
    });

    if (!store) {
      throw new NotFoundException(
        this.i18n.t('translation.store.not_found'),
      );
    }
    return this.storeUtilsService.mapStoreWithExtras(store);
  }

  async changeStoreStatus(status: StoreStatus, storeId: number,lang = Language.ar) {
    const store = await this.getStoreById(storeId);
    if (status === StoreStatus.APPROVED)
    {
      if(!store.isCompletedProfile)
      {
        throw new BadRequestException(this.i18n.translate('translation.store.incomplete_profile', { lang }));
      }
      await this.storeCommissionService.getCommission(storeId)
      const message = this.i18n.t(`translation.sms.store_approved`, { lang });
      await this.smsService.sendSms(store.phone, message);
    }
    store.status = status;
    await store.save();
    return {storeId:store.id, message: this.i18n.t('translation.store.status_updated',{lang}) };
  }

  async getStoreById(id: string | number) {
    const store = await this.storeRepo.findByPk(id);
    if (!store) {
      throw new BadRequestException('store is not found');
    }
    return store
  }

  countStoreBySubTypeId(subTypeId: number) {
    return this.storeRepo.count({ where: { subTypeId } });
  }

  async updateStore(store: Store, dto: UpdateStoreDto, lang = Language.en) {
    const transaction = await this.sequelize.transaction();

    try {
      if (dto.phone && dto.phone !== store.phone) {
        const existingStore = await this.storeRepo.findOne({
          where: { phone: dto.phone },
          transaction,
        });
        if (existingStore) {
          throw new BadRequestException(
            this.i18n.t('translation.store.phone_in_use', { lang }),
          );
        }
      }

      if (dto.subTypeId !== undefined) {
        await this.subTypeService.subTypeById(+dto.subTypeId);
      }
      if (dto.sectorId !== undefined) {
        await this.sectorService.findOne(+dto.sectorId);
      }

      Object.assign(store, {
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.inStore !== undefined && { inStore: dto.inStore }),
        ...(dto.driveThru !== undefined && { driveThru: dto.driveThru }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.commercialRegister !== undefined && { commercialRegister: dto.commercialRegister }),
        ...(dto.taxNumber !== undefined && { taxNumber: dto.taxNumber }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.isOnline !== undefined && { isOnline: dto.isOnline }),
        ...(dto.subTypeId !== undefined && { subTypeId: dto.subTypeId }),
        ...(dto.sectorId !== undefined && { sectorId: dto.sectorId }),
      });
      await store.save({ transaction });

      if (dto.openingHours && dto.openingHours.length > 0) {
        await this.openingHourService.updateStoreOpeningHours(
          store.id,
          dto.openingHours,
          transaction,
        );
      }

      if (dto.languages) {
        for (const t of dto.languages) {
          const duplicate = await this.storeLanguageRepo.findOne({
            where: {
              languageCode: t.languageCode,
              name: t.name,
              storeId: { [Op.ne]: store.id },
            },
            transaction,
          });

          if (duplicate) {
            throw new BadRequestException(
              this.i18n.t('translation.store.name_in_use', { lang }),
            );
          }

          const existing = await this.storeLanguageRepo.findOne({
            where: { storeId: store.id, languageCode: t.languageCode },
            transaction,
          });

          if (existing) {
            existing.name = t.name;
            if (t.brand) existing.brand = t.brand;
            await existing.save({ transaction });
          } else {
            await this.storeLanguageRepo.create(
              {
                storeId: store.id,
                languageCode: t.languageCode,
                name: t.name,
                ...(t.brand ? { brand: t.brand } : {}),
              },
              { transaction },
            );
          }
        }
      }

      await transaction.commit();
      return {
        message: this.i18n.t('translation.store.updated_successfully', { lang }),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateStoreImages(store: Store,logo?: Express.Multer.File,cover?: Express.Multer.File,lang?: Language) {
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

  async updateStoreLegalInfo(store: Store,dto: UpdateStoreLegalInfoDto,taxNumberFile?: Express.Multer.File,commercialRegisterFile?: Express.Multer.File) 
  {
    const { taxNumber, commercialRegister } = dto;
    if (taxNumberFile) {
      if (store.taxNumberPublicId)
        await this.cloudinaryService.deleteImage(store.taxNumberPublicId);

      const uploaded = await this.cloudinaryService.uploadImage(taxNumberFile);
      store.taxNumberUrl = uploaded.secure_url;
      store.taxNumberPublicId = uploaded.public_id;
    }

    if (commercialRegisterFile) {
      if (store.commercialRegisterPublicId)
        await this.cloudinaryService.deleteImage(store.commercialRegisterPublicId);

      const uploaded = await this.cloudinaryService.uploadImage(commercialRegisterFile);
      store.commercialRegisterUrl = uploaded.secure_url;
      store.commercialRegisterPublicId = uploaded.public_id;
    }

    if (taxNumber) store.taxNumber = taxNumber;
    if (commercialRegister) store.commercialRegister = commercialRegister;

    await store.save();

    return {message: 'Legal info updated successfully',};
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

  getCurrentStore(storeId:number)
  {
    return this.storeRepo.findOne({
      where:{id:storeId},
      include:[OpeningHour,StoreLanguage]
    })
  }

  async getIncompleteStoreInfo(ownerId:number,lang:Language)
  {
    const store = await this.storeRepo.findOne({where: { ownerId, isCompletedProfile: false },
    include:[{model:StoreLanguage},{model:Sector,include:[{model:SectorLanguage,where:{languageCode:lang}}]}]})
    if(store)
    {
      return {store,hasIncompleteStore:true}
    }
    else{
      return {hasIncompleteStore:false}
    }
  }

    async getAllIncompleteStores(lang: Language,page = 1,limit = 10) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.storeRepo.findAndCountAll({
      where: { isCompletedProfile: false },
      include: [
        { model: StoreLanguage },
        {
          model: Sector,
          include: [{ model: SectorLanguage, where: { languageCode: lang } }],
        },
        { model: Owner, as: 'owner' }
      ],
      offset,
      limit,
      distinct: true,
      col: 'id',
      order: [['createdAt', 'DESC']],
    });

    return {
      stores: rows,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
  }

  // for soft and hard delete
  async findDeletedStore(storeId:number,transaction?:any)
  {
    const store = await this.storeRepo.findByPk(storeId, { paranoid: false,transaction});
    if (!store) throw new NotFoundException('Store not found');
    return store
  }

  async findDeletedStoresOlderThan(days: number, transaction?: any) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000); // 30 يوم مثلاً
      return this.storeRepo.findAll({
          where: {
              deletedAt: { [Op.lt]: cutoffDate },
          },
          paranoid: false,
          transaction,
      });
  }

  findAllStoresByOwnerForDeletion(ownerId:number)
  {
    return this.storeRepo.findAll({where:{ownerId}})
  }

  async findDeletedStoresByOwner(ownerId: number, transaction?: any) {
  return this.storeRepo.findAll({
    where: {
      ownerId,
      deletedAt: { [Op.not]: null },
    },
    paranoid: false,
    transaction,
  });
  }
}