import { Sector } from './../../sector/entities/sector.entity';
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
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Favorite } from 'src/modules/favirote/entities/favirote.entity';
import { OpeningHour } from 'src/modules/opening_hour/entites/opening_hour.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { Owner } from 'src/modules/owner/entities/owner.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { SubType } from 'src/modules/subtype/entities/subtype.entity';
import { StoreLanguage } from './store_language.entity';

@Table({ tableName: 'stores',paranoid:true })
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

  @AllowNull(true)
  @ForeignKey(() => SubType)
  @Column(DataType.INTEGER)
  subTypeId: number;

  @BelongsTo(() => SubType)
  subType: SubType;

  @ForeignKey(() => Sector)
  @Column(DataType.INTEGER)
  sectorId: number;

  @BelongsTo(() => Sector)
  sector: Sector;

  @HasMany(() => StoreLanguage)
  languages: StoreLanguage[];

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.ENUM(...cities))
  city: City;

  @Column(DataType.FLOAT)
  lat: number;

  @Column(DataType.FLOAT)
  lng: number;

  @Column(DataType.STRING)
  logoUrl: string;

  @Column(DataType.STRING)
  logoPublicId: string;

  @Column(DataType.STRING)
  coverUrl: string;

  @Column(DataType.STRING)
  coverPublicId: string;

  @Column({ type: DataType.STRING, unique: true })
  phone: string;

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

  @Column(DataType.STRING)
  commercialRegister: string;

  @Column(DataType.STRING)
  taxNumber: string;

  @Default(StoreStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(StoreStatus)))
  status: StoreStatus;

  @Default(false)
  @Column(DataType.BOOLEAN)
  driveThru: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  inStore: boolean;

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Product)
  product: Product[];

  @HasMany(() => Category)
  categories: Category[];

  @HasMany(() => OpeningHour)
  openingHours: OpeningHour[];

  @BelongsToMany(() => Customer, () => Favorite)
  customersWhoFavorited: Customer[];

  @HasMany(() => Review)
  reviews: Review[];

  @Default(true)
  @Column(DataType.BOOLEAN)
  isOnline: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCompletedProfile: boolean;

  @Column({type: DataType.STRING,allowNull: false,defaultValue: 'Asia/Riyadh'})
  timezone: string;
}