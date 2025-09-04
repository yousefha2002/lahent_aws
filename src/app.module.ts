import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { CartModule } from './modules/cart/cart.module';
import { CartItemModule } from './modules/cart_item/cart_item.module';
import { CartItemExtraModule } from './modules/cart_item_extra/cart_item_extra.module';
import { CartItemInstructionModule } from './modules/cart_item_instruction/cart_item_instruction.module';
import { CartItemVariantModule } from './modules/cart_item_variant/cart_item_variant.module';
import { OpeningHourModule } from './modules/opening_hour/opening_hour.module';
import { CategoryModule } from './modules/category/category.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OfferModule } from './modules/offer/offer.module';
import { OtpCodeModule } from './modules/otp_code/otp_code.module';
import { OwnerModule } from './modules/owner/owner.module';
import { ProductModule } from './modules/product/product.module';
import { ProductExtraModule } from './modules/product_extra/product_extra.module';
import { ProductImageModule } from './modules/product_image/product_image.module';
import { ProductInstructionModule } from './modules/product_instruction/product_instruction.module';
import { ProuductVariantModule } from './modules/prouduct_variant/prouduct_variant.module';
import { StoreModule } from './modules/store/store.module';
import { TypeModule } from './modules/type/type.module';
import { AdminModule } from './modules/admin/admin.module';
import { OrderModule } from './modules/order/order.module';
import { OrderItemModule } from './modules/order_item/order_item.module';
import { OrderItemExtraModule } from './modules/order_item_extra/order_item_extra.module';
import { OrderItemVariantModule } from './modules/order_item_variant/order_item_variant.module';
import { OrderItemInstructionModule } from './modules/order_item_instruction/order_item_instruction.module';
import { AddressModule } from './modules/address/address.module';
import { CarModule } from './modules/car/car.module';
import { MulterConfigService } from './multer/multer.config';
import { MulterModule } from '@nestjs/platform-express';
import { AvatarModule } from './modules/avatar/avatar.module';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { CarTypeModule } from './modules/car_type/car_type.module';
import { CarBrandModule } from './modules/car_brand/car_brand.module';
import { CarModelModule } from './modules/car_model/car_model.module';
import { OfferProductModule } from './modules/offer_product/offer_product.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { SmsModule } from './modules/sms/sms.module';
import { GiftCategoryModule } from './modules/gift_category/gift_category.module';
import { GiftTemplateModule } from './modules/gift_template/gift_template.module';
import { GiftModule } from './modules/gift/gift.module';
import { LoyaltyOfferModule } from './modules/loyalty_offer/loyalty_offer.module';
import { UserPointHistoryModule } from './modules/user_point_history/user_point_history.module';
import { SubtypeModule } from './modules/subtype/subtype.module';
import { PaymentSessionModule } from './modules/payment_session/payment_session.module';
import * as path from 'path';
import { TransactionModule } from './modules/transaction/transaction.module';
import { OfferCategoryModule } from './modules/offer_category/offer_category.module';
import { FaviroteModule } from './modules/favirote/favirote.module';
import { ReviewModule } from './modules/review/review.module';
import { EdfapayModule } from './modules/edfapay/edfapay.module';
import { VariantCategoryModule } from './modules/variant_category/variant_category.module';
import { ProductCategoryVariantModule } from './modules/product_category_variant/product_category_variant.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UserTokenModule } from './modules/user_token/user_token.module';
import { SectorModule } from './modules/sector/sector.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: path.resolve(process.cwd(), 'src/i18n'),
        watch: false,
      },
      resolvers: [
        new AcceptLanguageResolver(), 
      ],
    }),    
    JwtModule.register({ global: true, secret: 'token' }),
    JwtModule.register({ global: true, secret: 'refresh_token' }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    AdminModule,
    AppModule,
    CartModule,
    CartItemModule,
    CartItemExtraModule,
    CartItemInstructionModule,
    CartItemVariantModule,
    CategoryModule,
    CustomerModule,
    OfferModule,
    OpeningHourModule,
    OtpCodeModule,
    OwnerModule,
    ProductModule,
    ProductExtraModule,
    ProductImageModule,
    ProductInstructionModule,
    ProuductVariantModule,
    StoreModule,
    TypeModule,
    OrderModule,
    OrderItemModule,
    OrderItemExtraModule,
    OrderItemVariantModule,
    OrderItemInstructionModule,
    AddressModule,
    CarModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    AvatarModule,
    CarTypeModule,
    CarBrandModule,
    CarModelModule,
    OfferProductModule,
    CouponModule,
    SmsModule,
    GiftCategoryModule,
    GiftTemplateModule,
    GiftModule,
    LoyaltyOfferModule,
    UserPointHistoryModule,
    TransactionModule,
    SubtypeModule,
    PaymentSessionModule,
    OfferCategoryModule,
    FaviroteModule,
    ReviewModule,
    EdfapayModule,
    VariantCategoryModule,
    ProductCategoryVariantModule,
    UserTokenModule,
    SectorModule,
  ],
  providers: [MulterConfigService],
})
export class AppModule {
}
