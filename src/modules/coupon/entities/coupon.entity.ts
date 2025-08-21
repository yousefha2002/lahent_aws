import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'coupons' })
export class Coupon extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column({ type: DataType.STRING, unique: true })
  code: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100,
    },
  })
  discountPercentage: number;

  @Column(DataType.INTEGER)
  maxUsage: number;

  @Default(0)
  @Column(DataType.INTEGER)
  usedCount: number;

  @Column(DataType.DATE)
  expiryDate: Date;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  // ✅ storeId يمكن أن يكون null إذا أنشأه الأدمن
  @ForeignKey(() => Store)
  @Column({ type: DataType.INTEGER, allowNull: true })
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  // ✅ من أنشأ الكوبون: true = admin، false = store
  @Default(false)
  @Column(DataType.BOOLEAN)
  byAdmin: boolean;
}
