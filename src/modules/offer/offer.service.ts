import { CategoryService } from './../category/category.service';
import { ProductService } from './../product/product.service';
import { OfferCategoryService } from './../offer_category/offer_category.service';
import { OfferProductService } from './../offer_product/offer_product.service';
import { StoreStatus } from 'src/common/enums/store_status';
import {BadRequestException,forwardRef,Inject,Injectable} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Offer } from './entities/offer.entity';
import { OfferType } from 'src/common/enums/offer_type';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ChangeOfferActiveDto } from './dto/change-offer-active.dto';
import { Op, Sequelize } from 'sequelize';
import { Store } from '../store/entities/store.entity';
import { Product } from '../product/entities/product.entity';
import { ProductImage } from '../product_image/entities/product_image.entity';
import { mapOfferToResponse } from './utils/offer.mapper';
import { TargetType } from 'src/common/enums/target_type';
import { Category } from '../category/entities/category.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { StoreLanguage } from '../store/entities/store_language.entity';
import { CategoryLanguage } from '../category/entities/category_language.entity';

@Injectable()
export class OfferService {
  constructor(
    @Inject(repositories.offer_repository) private offerRepo: typeof Offer,
    private offerProductService: OfferProductService,
    private offerCategoryService: OfferCategoryService,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private categoryService: CategoryService,
    private readonly i18n: I18nService,
  ) {}

  async createOffer(dto: CreateOfferDto, storeId: number, lang = Language.en) {
    const { name, target, startDate, productIds, categoryIds } = dto;

    if (startDate <= new Date()) {
      throw new BadRequestException(
        this.i18n.translate('translation.offer.start_date_future', { lang }),
      );
    }

    const existing = await this.offerRepo.findOne({ where: { storeId, name } });
    if (existing) {
      throw new BadRequestException(
        this.i18n.translate('translation.offer.name_exists_for_store', { lang }),
      );
    }

    this.validateOfferDto(dto, lang);

    if (target === TargetType.PRODUCT) {
      if (!productIds || productIds.length === 0) {
        throw new BadRequestException(
          this.i18n.translate('translation.offer.products_required', { lang }),
        );
      }
      await this.productService.validateProductsExistence(productIds,storeId);
    }

    if (target === TargetType.CATEGROY) {
      if (!categoryIds || categoryIds.length === 0) {
        throw new BadRequestException(
          this.i18n.translate('translation.offer.categories_required', { lang }),
        );
      }
      await this.categoryService.validateCategoriesExistence(categoryIds,storeId);
    }

    const offer = await this.offerRepo.create({ ...dto, storeId });

    if (target === TargetType.PRODUCT) {
      await this.offerProductService.linkProductsToOffer(offer.id, productIds!);
    } else if (target === TargetType.CATEGROY) {
      await this.offerCategoryService.linkCategoriesToOffer(
        offer.id,
        categoryIds!,
      );
    }

    return { message: this.i18n.translate('translation.offer.created', { lang }) };
  }

  async offerById(offerId: string | number, lang = Language.en) {
    const offer = await this.offerRepo.findByPk(offerId);
    if (!offer) {
      throw new BadRequestException(this.i18n.translate('translation.offer.not_found', { lang }));
    }
    return offer;
  }

  async changeOfferActiveStatus(
    offerId: number,
    dto: ChangeOfferActiveDto,
    lang = Language.en,
  ) {
    const offer = await this.offerById(offerId, lang);
    offer.isActive = dto.isActive;
    await offer.save();
    return { message: this.i18n.translate('translation.offer.active_status_updated', { lang }) };
  }

  async getActiveOffersWithStoreDetails(
    page: number,
    limit: number,
    lang=Language.ar,
    storeId?: number,
  ) {
    const now = new Date();
    const offset = (page - 1) * limit;

    const [offers, totalItems] = await Promise.all([
      this.offerRepo.findAll({
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          ...(storeId ? { storeId } : {}),
          ...this.getDurationActiveCondition(),
        },
        include: [
          {
            model: Store,
            required:true,
            where: { status: StoreStatus.APPROVED },
            include:[{model:StoreLanguage,where:{languageCode:lang}}]
          },
          {
            model: Product,
            include: [
              {
                model: ProductImage,
                attributes: ['imageUrl'],
                limit: 1,
              },
            ],
          },
          {
            model: Category,
            include:[{model:CategoryLanguage,where:{languageCode:lang},required:false}]
          },
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      }),

      this.offerRepo.count({
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          ...(storeId ? { storeId } : {}),
          ...this.getDurationActiveCondition(),
        },
      }),
    ]);

    return {
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      offers: offers.map((offer) =>
        mapOfferToResponse(offer, {
          includeStore: true,
        }),
      ),
    };
  }

  async getAllOffersForStore(
    storeId: number,
    page: number,
    limit: number,
    lang:Language,
    type?: string,
  ) {
    const offset = (page - 1) * limit;

    const { rows: offers, count: totalItems } = await this.offerRepo.findAndCountAll({
      where: { storeId, ...(type ? { type } : {}) },
      include: [
        {
          model: Product,
          include: [
            { model: ProductImage, attributes: ['imageUrl'], limit: 1 },
          ],
        },
        {
          model: Category,
          include: [{ model: CategoryLanguage, where: { languageCode: lang }, required: false }],
        },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
      col: 'id',
      limit,
      offset,
    });

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      offers: offers.map((offer) =>
        mapOfferToResponse(offer, {
          includeUsedCount: true,
        }),
      ),
    };
  }

  getDurationActiveCondition(): any {
    return {
      [Op.or]: [
        Sequelize.literal(
          `(durationUnit = 'DAYS' AND DATE_ADD(startDate, INTERVAL duration DAY) > NOW())`,
        ),
        Sequelize.literal(
          `(durationUnit = 'HOURS' AND DATE_ADD(startDate, INTERVAL duration HOUR) > NOW())`,
        ),
      ],
    };
  }

  getDiscountedPrice(basePrice: number, offer: any): number {
    if (!offer) return basePrice;

    let discountedPrice = basePrice;

    if (offer.discountAmount !== null && offer.discountAmount !== undefined) {
      discountedPrice = basePrice - offer.discountAmount;
    } else if (
      offer.discountPercentage !== undefined &&
      offer.discountPercentage !== null
    ) {
      discountedPrice =
        basePrice - (basePrice * offer.discountPercentage) / 100;
    }

    return discountedPrice < 0 ? 0 : discountedPrice;
  }

  async getActiveOfferForProduct(productId: number) {
    const now = new Date();
    const product = await this.productService.productById(productId);
    const productOffer = await this.offerRepo.findOne({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        ...this.getDurationActiveCondition(),
        target: TargetType.PRODUCT,
      },
      include: [
        {
          model: Product,
          where: { id: productId },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    if (productOffer) return productOffer;

    const categoryOffer = await this.offerRepo.findOne({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        ...this.getDurationActiveCondition(),
        target: TargetType.CATEGROY,
      },
      include: [
        {
          model: Category,
          where: { id: product.categoryId },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    if (categoryOffer) return categoryOffer;

    const generalOffer = await this.offerRepo.findOne({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        ...this.getDurationActiveCondition(),
        target: TargetType.ALL,
      },
      order: [['createdAt', 'DESC']],
    });

    return generalOffer || null;
  }

  private validateOfferDto(dto: CreateOfferDto, lang = Language.en) {
    const { type } = dto;

    if (type === OfferType.FIXED) {
      if (dto.discountAmount == null) {
        throw new BadRequestException(
          this.i18n.translate('translation.offer.fixed_price_required', { lang }),
        );
      }
      dto.discountPercentage = null;
      dto.buyQty = null;
      dto.getFreeQty = null;
    } else if (type === OfferType.PERCENTAGE) {
      if (dto.discountPercentage == null) {
        throw new BadRequestException(
          this.i18n.translate('translation.offer.discount_percentage_required', { lang }),
        );
      }
      dto.discountAmount = null;
      dto.buyQty = null;
      dto.getFreeQty = null;
    } else if (type === OfferType.INCENTIVE) {
      if (dto.buyQty == null || dto.getFreeQty == null) {
        throw new BadRequestException(
          this.i18n.translate('translation.offer.buy_get_qty_required', { lang }),
        );
      }
      dto.discountAmount = null;
      dto.discountPercentage = null;
    } else {
      throw new BadRequestException(this.i18n.translate('translation.offer.invalid_offer_type', { lang }));
    }
  }

  increamntOfferCount(id: number, transaction: any) {
    this.offerRepo.increment(
      { usedCount: 1 },
      { where: { id }, transaction },
    );
  }
}
