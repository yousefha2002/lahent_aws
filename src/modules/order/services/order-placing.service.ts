import { CouponService } from './../../coupon/coupon.service';
import { LoyaltySettingService } from './../../loyalty_setting/loyalty_setting.service';
import { StoreUtilsService } from './../../store/services/storeUtils.service';
import { StoreService } from 'src/modules/store/services/store.service';
import { CarService } from '../../car/car.service';
import { OrderItemVariantService } from '../../order_item_variant/order_item_variant.service';
import { OrderItemInstructionService } from '../../order_item_instruction/order_item_instruction.service';
import { OrderItemExtraService } from '../../order_item_extra/order_item_extra.service';
import { OrderItemService } from '../../order_item/order_item.service';
import { CartService } from '../../cart/cart.service';
import {BadRequestException,forwardRef,Inject,Injectable} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { createOrderDto } from '../dto/requests/create-order.dto';
import { OrderStatus } from 'src/common/enums/order_status';
import { PickupType } from 'src/common/enums/pickedup_type';
import { PaymentMethod } from 'src/common/enums/payment_method';
import {MIN_POINTS_TO_USE} from 'src/common/constants';
import { Customer } from '../../customer/entities/customer.entity';
import { round2 } from 'src/common/utils/round2';
import { Sequelize } from 'sequelize';
import { StoreStatus } from 'src/common/enums/store_status';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { OfferType } from 'src/common/enums/offer_type';
import { Store } from 'src/modules/store/entities/store.entity';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';
import { CreateCartProductDto } from 'src/modules/cart/dto/create-product-cart.dto';

@Injectable()
export class OrderPlacingService {
    constructor(
        @Inject(repositories.order_repository) private orderRepo: typeof Order,
        private readonly cartService: CartService,
        private readonly orderItemExtraService: OrderItemExtraService,
        private readonly orderItemInstructionService: OrderItemInstructionService,
        private readonly orderItemVariantService: OrderItemVariantService,
        private readonly orderItemService: OrderItemService,

        @Inject(forwardRef(() => CarService))
        private readonly carService: CarService,
        private readonly storeService: StoreService,
        private readonly storeUtilsService: StoreUtilsService,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly i18n: I18nService,
        private loyaltySettingService:LoyaltySettingService,

        @Inject(forwardRef(() => CouponService))
        private couponService:CouponService
    ) {}

    async placeOrder(user: Customer, dto: createOrderDto, lang:Language) 
    {
        const transaction = await this.sequelize.transaction();
        try {
            const pointsUsedSafe = dto.pointsUsed ?? 0;

            // جلب المتجر
            const store = await this.storeService.storeById(dto.storeId);
            if(!store)
            {
                throw new BadRequestException('store is not found')
            }

            // التحقق من صلاحية المتجر والطلب
            await this.validateStoreAndOrder(user, pointsUsedSafe, dto, store, lang);

            // التحقق من توفر المتجر في الوقت الحالي أو المجدول
            await this.checkStoreAvailability(dto.storeId,lang, dto.scheduledAt);

            // التعامل مع السيارة للـ DRIVE_THRU
            const finalCarId = await this.resolveCar(user, dto, lang, transaction);

            // جلب سلة الطلبات
            const cart = await this.cartService.getCartItemsWithOffers(dto.storeId, user.id, lang, dto.couponCode);
            const { items, estimatedTime } = cart;

            // حساب الدفع بالنقاط والمحفظة أو البوابة
            const loyaltySetting = await this.loyaltySettingService.getSettings();
            const {pointsRedeemed, pointsAmountUsed, walletAmountUsed, gatewayAmountUsed } = 
                this.calculatePayment(cart.totalFinalPrice, pointsUsedSafe, user, dto.paymentMethod, loyaltySetting.currencyPerPoint);
            // إنشاء الطلب
            const order = await this.orderRepo.create({
                customerId: user.id,
                storeId: dto.storeId,
                subtotalBeforeDiscount: cart.totalFinalPrice - cart.couponDiscountAmount,
                estimatedTime,
                discountCouponAmount: cart.couponDiscountAmount,
                finalPriceToPay: cart.totalFinalPrice,
                couponId: cart.couponId,
                status: OrderStatus.PENDING_PAYMENT,
                isPaid: false,
                pickupType: dto.pickupType,
                scheduledAt: dto.scheduledAt || null,
                isScheduled: !!dto.scheduledAt,
                pickupByCustomer: dto.pickupByCustomer,
                pickupPersonName: dto.pickupByCustomer ? null : dto.pickupPersonName,
                pickupPersonNumber: dto.pickupByCustomer ? null : dto.pickupPersonNumber,
                walletAmountUsed,
                gatewayAmountUsed,
                paymentGateway: dto.gatewayType || null,
                paymentMethod: dto.paymentMethod,
                pointsAmountUsed: pointsAmountUsed || 0,
                pointsRedeemed: pointsRedeemed || 0,
                pointsEarned: cart.pointsEarned || 0,
                carId: finalCarId
            }, { transaction });

            if (cart.couponId) {
                this.couponService.increamntOCouponCount(cart.couponId, transaction);
            }

            // إنشاء عناصر الطلب (Products)
            for (const item of items) {
                const productName = this.getNameByLang(item.product, lang);
                const extrasForDb = item.extras.map(e => ({ ...e, name: this.getNameByLang(e, lang) }));
                const instructionsForDb = item.instructions.map(i => ({ ...i, name: this.getNameByLang(i, lang) }));
                const variantsForDb = item.variants.map(v => ({
                    ...v,
                    name: this.getNameByLang(v, lang),
                    category: this.getNameByLang(v.variantCategory, lang)
                }));

                let freeQty = 0;
                if (item.product.offer && item.product.offer.type === OfferType.INCENTIVE) {
                    freeQty = Math.floor(item.quantity * (item.product.offer.getFreeQty / item.product.offer.buyQty));
                }

                const orderItem = await this.orderItemService.createOrderItem({
                    orderId: order.id,
                    productId: item.product.id,
                    productName,
                    productImageUrl: item.product.images[0],
                    unitBasePrice: item.product.basePrice,
                    unitDiscountedPrice: item.product.discountedPrice,
                    unitFinalPrice: item.finalPrice,
                    finalSubtotal: round2(item.finalPrice * item.quantity),
                    quantity: item.quantity,
                    offerId: item.product.offer?.id ?? null,
                    freeQty,
                    note: item.note
                }, transaction);

                await Promise.all([
                    this.orderItemExtraService.createExtras(orderItem.id, extrasForDb, transaction),
                    this.orderItemVariantService.createVariants(orderItem.id, variantsForDb, transaction),
                    this.orderItemInstructionService.createInstructions(orderItem.id, instructionsForDb, transaction)
                ]);
            }

            // حذف السلة بعد إتمام الطلب
            await this.cartService.deleteCart(dto.storeId, user.id, transaction);

            await transaction.commit();
            return {
                orderId: order.id,
                totalPrice: round2(cart.totalFinalPrice),
                message: this.i18n.translate('translation.orders.order_placed_successfully', { lang }),
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
}

    private async resolveCar(user: Customer, dto: createOrderDto, lang: Language, transaction:any): Promise<number | null> {
        if (dto.pickupType !== PickupType.DRIVE_THRU) return null;

        let finalCarId = dto.carId ?? null;

        if (!finalCarId && dto.newCar) {
            const car = await this.carService.create(user.id, dto.newCar, lang, transaction);
            finalCarId = car.carId;
        } else if (finalCarId) {
            await this.carService.getCustomerCar(user.id, finalCarId, lang);
        }

        if (!finalCarId) {
            throw new BadRequestException(this.i18n.translate('translation.orders.car_required', { lang }));
        }

        return finalCarId;
    }

    private async checkStoreAvailability(storeId: number,lang:Language, scheduledAt?: Date) 
    {
        if (scheduledAt) {
            const storeIsOpen = await this.storeUtilsService.isStoreOpenAt(storeId, scheduledAt);
            if (!storeIsOpen) throw this.i18n.translate('translation.orders.store_closed_scheduled', {lang,})
        } else {
            const now = new Date();
            const storeIsOpenNow = await this.storeUtilsService.isStoreOpenAt(storeId, now);
            if (!storeIsOpenNow) throw new BadRequestException(this.i18n.translate('translation.orders.store_closed_now',{lang,}))
        }
    }

    private calculatePayment(cartTotal: number, pointsUsed: number, user: Customer, paymentMethod: PaymentMethod, currencyPerPoint:number) 
    {
        const neededPoints = Math.ceil(cartTotal / currencyPerPoint);
        const pointsRedeemed = Math.min(pointsUsed, neededPoints);
        const pointsAmountUsed = round2(pointsRedeemed * currencyPerPoint);
        let remainingAmount = round2(cartTotal - pointsAmountUsed);
        if (isNaN(remainingAmount) || remainingAmount < 0) remainingAmount = 0;

        let walletAmountUsed = 0;
        let gatewayAmountUsed = 0;

        if (remainingAmount > 0) {
            if (paymentMethod === PaymentMethod.WALLET) {
                if (remainingAmount > user.walletBalance) {
                    throw new BadRequestException('Insufficient wallet balance');
                }
                walletAmountUsed = round2(remainingAmount);
            } else if (paymentMethod === PaymentMethod.GATEWAY) {
                gatewayAmountUsed = round2(remainingAmount);
            } else {
                throw new BadRequestException('Invalid payment method');
            }
        }

        return { pointsRedeemed,pointsAmountUsed, remainingAmount, walletAmountUsed, gatewayAmountUsed };
    }

    private getNameByLang(item: any, lang: Language) {
        return item.languages?.find(l => l.languageCode === lang)?.name ?? item.languages?.[0]?.name ?? '';
    }

    private async validateStoreAndOrder(user: Customer,pointsUsedSafe:number, dto: createOrderDto, store: Store, lang: Language) 
    {
        const { pickupType, pickupByCustomer, pickupPersonName, pickupPersonNumber, scheduledAt } = dto;

        if (!store || store.status !== StoreStatus.APPROVED || !store.isOnline) {
            throw new BadRequestException(this.i18n.translate('translation.orders.store_unavailable', { lang }));
        }

        if (pickupType === PickupType.DRIVE_THRU && !store.driveThru) {
            throw new BadRequestException(this.i18n.translate('translation.orders.store_no_drive_thru', { lang }));
        }

        if (pickupType === PickupType.IN_STORE && !store.inStore) {
            throw new BadRequestException(this.i18n.translate('translation.orders.store_no_in_store', { lang }));
        }

        if (pointsUsedSafe > 0 && user.points < MIN_POINTS_TO_USE) {
            throw new BadRequestException(this.i18n.translate('translation.orders.min_points_required', { lang }));
        }

        if (pointsUsedSafe > user.points) {
            throw new BadRequestException(this.i18n.translate('translation.orders.points_exceed_balance', { lang }));
        }

        if (scheduledAt && new Date(scheduledAt) <= new Date()) {
            throw new BadRequestException(this.i18n.translate('translation.orders.scheduled_in_past', { lang }));
        }

        if (pickupByCustomer === undefined || pickupByCustomer === null) {
            throw new BadRequestException(this.i18n.translate('translation.orders.pickup_required', { lang }));
        }

        if (pickupByCustomer && (pickupPersonName || pickupPersonNumber)) {
            throw new BadRequestException(this.i18n.translate('translation.orders.pickup_self_no_other', { lang }));
        }

        if (!pickupByCustomer && (!pickupPersonName || !pickupPersonNumber)) {
            throw new BadRequestException(this.i18n.translate('translation.orders.pickup_person_required', { lang }));
        }
    }

    async reorder(oldOrderId: number, customer: Customer, lang: Language) 
    {
        const transaction = await this.sequelize.transaction();

        try {
            const oldOrder = await this.orderRepo.findOne({
            where: { id: oldOrderId, customerId: customer.id },
            include: [
                { model: OrderItem, include: ['extras', 'instructions', 'variants'] },
            ],
            transaction,
            });

            if (!oldOrder) {
                throw new BadRequestException(this.i18n.translate('translation.orders.not_found', { lang }));
            }

            const oldItems = oldOrder.orderItems;

            // أضف كل منتج للسلة
            for (const item of oldItems) {
                const dto: CreateCartProductDto = {
                    productId: item.productId,
                    quantity: item.quantity,
                    note: item.note,
                    variants: item.variants.map(v => v.variantId),
                    extras: item.extras.map(e => e.extraId),
                    instructions: item.instructions.map(i => i.instructionId),
                };

                await this.cartService.createProductCart(dto, customer.id, lang);
            }

            await transaction.commit();

            return {message: this.i18n.translate('translation.orders.reorder_added_to_cart', { lang })};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}