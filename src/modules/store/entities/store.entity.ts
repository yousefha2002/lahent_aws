import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { cities } from 'src/common/constants/cities';

import { StoreStatus } from 'src/common/enums/store_status';
import { City } from 'src/common/types/city';
import { Category } from 'src/modules/category/entities/category.entity';
import { Coupon } from 'src/modules/coupon/entities/coupon.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Favorite } from 'src/modules/favirote/entities/favirote.entity';
import { OpeningHour } from 'src/modules/opening_hour/entites/opening_hour.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { Owner } from 'src/modules/owner/entities/owner.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { SubType } from 'src/modules/subtype/entities/subtype.entity';
import { StoreLanguage } from './store_language.entity';

@Table({ tableName: 'stores' })
export class Store extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Owner)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  ownerId: number;

  @BelongsTo(() => Owner)
  owner: Owner;

  @ForeignKey(() => SubType)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  subTypeId: number;

  @BelongsTo(() => SubType)
  subType: SubType;

  @HasMany(() => StoreLanguage)
  languages: StoreLanguage[];

  @AllowNull(false)
  @Column(DataType.STRING)
  password: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...cities))
  city: City;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  lat: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  lng: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  logoUrl: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  logoPublicId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  coverUrl: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  coverPublicId: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING, unique: true })
  phone: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING, unique: true })
  phoneLogin: string;

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.FLOAT })
  rate: number;

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.INTEGER })
  numberOfRates: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  commercialRegister: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  taxNumber: string;

  @Default(StoreStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(StoreStatus)))
  status: StoreStatus;

  @Default(false)
  @Column(DataType.BOOLEAN)
  drive_thru: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  in_store: boolean;

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Product)
  product: Product[];

  @HasMany(() => Category)
  categories: Category[];

  @HasMany(() => OpeningHour)
  openingHours: OpeningHour[];

  @HasMany(() => Coupon)
  coupon: Coupon[];

  @BelongsToMany(() => Customer, () => Favorite)
  customersWhoFavorited: Customer[];

  @HasMany(() => Review)
  reviews: Review[];
}