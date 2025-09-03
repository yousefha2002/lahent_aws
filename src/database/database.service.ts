import { Sequelize } from 'sequelize-typescript';
import { Admin } from '../modules/admin/entities/admin.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart_item/entities/cart_item.entity';
import { CartItemExtra } from 'src/modules/cart_item_extra/entities/cart_item.entity';
import { CartItemInstruction } from 'src/modules/cart_item_instruction/entities/cart_item_instruction.entity';
import { CartItemVariant } from 'src/modules/cart_item_variant/entities/cart_item_variant.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Offer } from 'src/modules/offer/entities/offer.entity';
import { OpeningHour } from 'src/modules/opening_hour/entites/opening_hour.entity';
import { OtpCode } from 'src/modules/otp_code/entities/otp_code.entity';
import { Owner } from 'src/modules/owner/entities/owner.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductExtra } from 'src/modules/product_extra/entities/product_extra.entity';
import { ProductImage } from 'src/modules/product_image/entities/product_image.entity';
import { ProductInstruction } from 'src/modules/product_instruction/entities/product_instruction.entity';
import { ProductVariant } from 'src/modules/prouduct_variant/entities/prouduct_variant.entity';
import { Store } from 'src/modules/store/entities/store.entity';
import { Type } from 'src/modules/type/entities/type.entity';
import { TypeLanguage } from 'src/modules/type/entities/type_language.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { Car } from 'src/modules/car/entities/car.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';
import { OrderItemExtra } from 'src/modules/order_item_extra/entities/order_item_extra.entity';
import { OrderItemVariant } from 'src/modules/order_item_variant/entities/order_item_variant.entity';
import { OrderItemInstruction } from 'src/modules/order_item_instruction/entities/order_item_instruction.entity';
import { Avatar } from 'src/modules/avatar/entities/avatar.entity';
import { CarType } from 'src/modules/car_type/entites/car_type.entity';
import { CarBrand } from 'src/modules/car_brand/entities/car_brand.entity';
import { CarModel } from 'src/modules/car_model/entites/car_model.entity';
import { OfferProduct } from 'src/modules/offer_product/entites/offer_product.entity';
import { Coupon } from 'src/modules/coupon/entities/coupon.entity';
import { GiftCategory } from 'src/modules/gift_category/entites/gift_category.entity';
import { GiftTemplate } from 'src/modules/gift_template/entities/gift_template.entity';
import { Gift } from 'src/modules/gift/entities/gift.entity';
import { LoyaltyOffer } from 'src/modules/loyalty_offer/entites/loyalty_offer.entity';
import { UserPointsHistory } from 'src/modules/user_point_history/entites/user_point_history.entity';
import { SubType } from 'src/modules/subtype/entities/subtype.entity';
import { SubTypeLanguage } from 'src/modules/subtype/entities/sybtype_language.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { PaymentSession } from 'src/modules/payment_session/entities/payment_session.entity';
import { OfferCategory } from 'src/modules/offer_category/entites/offer_category.entity';
import { Favorite } from 'src/modules/favirote/entities/favirote.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { VariantCategory } from 'src/modules/variant_category/entities/variant_category.entity';
import { ProductCategoryVariant } from 'src/modules/product_category_variant/entities/product_category_variant.entity';
import { StoreLanguage } from 'src/modules/store/entities/store_language.entity';
import { CarBrandLanguage } from 'src/modules/car_brand/entities/car_brand.languae.entity';
import { CategoryLanguage } from 'src/modules/category/entities/category_language.entity';
import { CarTypeLanguage } from 'src/modules/car_type/entites/car_type_language.entity';
import { CarModelLanguage } from 'src/modules/car_model/entites/car_mode_language.entity';
import { VariantCategoryLanguage } from 'src/modules/variant_category/entities/variant_category_language.entity';
import { ProductLanguage } from 'src/modules/product/entities/product_language.entity';
import { ProductExtraLanguage } from 'src/modules/product_extra/entities/product_extra_language.entity';
import { ProductVariantLanguage } from 'src/modules/prouduct_variant/entities/product_variant_language.entity';
import { ProductInstructionLanguage } from 'src/modules/product_instruction/entities/product_instruction_language.dto';
import { GiftCategoryLanguage } from 'src/modules/gift_category/entites/gift_category_language.entity';
import { UserToken } from 'src/modules/user_token/entities/user_token.entity';
import { Sector } from 'src/modules/sector/entities/sector.entity';
import { SectorLanguage } from 'src/modules/sector/entities/sectore_langauge.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'lahant-store.c4p0a0swsyob.us-east-1.rds.amazonaws.com',
        port: 3306,
        username: 'admin',
        password: '059283805928388',
        database: 'lahant-store',
      })

      // const sequelize = new Sequelize({
      //   dialect: 'mysql',
      //   host: 'localhost',
      //   port: 3306,
      //   username: 'root',
      //   password: '2838293yo',
      //   // password: '059283805928388',
      //   database: 'store_db',
      // });

      sequelize.addModels([
        Admin,
        Cart,
        CartItem,
        CartItemExtra,
        CartItemInstruction,
        CartItemVariant,
        Category,
        Customer,
        Offer,
        Order,
        OrderItem,
        OrderItemExtra,
        OrderItemVariant,
        OrderItemInstruction,
        OpeningHour,
        OtpCode,
        Owner,
        Product,
        ProductExtra,
        ProductImage,
        ProductInstruction,
        ProductVariant,
        Store,
        Type,
        TypeLanguage,
        Address,
        Car,
        Avatar,
        CarType,
        CarBrand,
        CarModel,
        OfferProduct,
        Coupon,
        GiftCategory,
        GiftTemplate,
        Gift,
        LoyaltyOffer,
        UserPointsHistory,
        SubType,
        SubTypeLanguage,
        Transaction,
        PaymentSession,
        OfferCategory,
        Favorite,
        Review,
        VariantCategory,
        ProductCategoryVariant,
        StoreLanguage,
        CarBrandLanguage,
        CategoryLanguage,
        CarTypeLanguage,
        CarModelLanguage,
        VariantCategoryLanguage,
        ProductLanguage,
        ProductExtraLanguage,
        ProductVariantLanguage,
        ProductInstructionLanguage,
        GiftCategoryLanguage,
        UserToken,
        Sector,
        SectorLanguage
      ]);
      await sequelize.sync({ alter: false });
      return sequelize;
    },
  },
];
