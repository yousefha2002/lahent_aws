import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { Address } from 'src/modules/address/entities/address.entity';
import { Avatar } from 'src/modules/avatar/entities/avatar.entity';
import { Car } from 'src/modules/car/entities/car.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Favorite } from 'src/modules/favirote/entities/favirote.entity';
import { Gift } from 'src/modules/gift/entities/gift.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { PaymentCard } from 'src/modules/payment_card/entities/payment_card.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'customers',paranoid: true })
export class Customer extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING, unique: true })
  phone: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING, unique: true })
  email: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCompletedProfile: boolean;

  @AllowNull(true)
  @Column(DataType.STRING)
  imageUrl: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  imagePublicId: string | null;

  @ForeignKey(() => Avatar)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  avatarId: number | null;

  @BelongsTo(() => Avatar)
  avatar: Avatar;

  @Default(0)
  @Column(DataType.INTEGER)
  points: number;

  @Default(0)
  @Column(DataType.FLOAT)
  walletBalance: number;

  @HasMany(() => Address)
  addresses: Address[];

  @HasMany(() => Car)
  cars: Car[];

  @HasMany(() => Cart)
  carts: Cart[];

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Gift, 'senderId')
  sentGifts: Gift[];

  @HasMany(() => Gift, 'receiverId')
  receivedGifts: Gift[];

  @BelongsToMany(() => Store, () => Favorite)
  favoriteStores: Store[];

  @HasMany(() => Review)
  reviews: Review[];

  @HasMany(() => PaymentCard)
  cards: PaymentCard[];

  @Column({ type: DataType.STRING, unique: true })
  referralCode: string;
}