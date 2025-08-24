import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { DurationUnit } from 'src/common/enums/dauration_unit';
import { OfferType } from 'src/common/enums/offer_type';
import { TargetType } from 'src/common/enums/target_type';
import { Category } from 'src/modules/category/entities/category.entity';
import { OfferCategory } from 'src/modules/offer_category/entites/offer_category.entity';
import { OfferProduct } from 'src/modules/offer_product/entites/offer_product.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'offers' })
export class Offer extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Store)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(OfferType)))
  type: OfferType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(TargetType)))
  target: TargetType;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  discountAmount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  discountPercentage: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  buyQty: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  getFreeQty: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  duration: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(DurationUnit)))
  durationUnit: DurationUnit;

  @AllowNull(false)
  @Column(DataType.DATE)
  startDate: Date;

  @BelongsToMany(() => Product, () => OfferProduct)
  products: Product[];

  @BelongsToMany(() => Category, () => OfferCategory)
  categories: Category[];

  @Default(0)
  @Column(DataType.INTEGER)
  usedCount: number;
}
