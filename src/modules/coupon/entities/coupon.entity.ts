import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
} from 'sequelize-typescript';

@Table({ 
    tableName: 'coupons',
    indexes: [{ name: 'idx_createdAt', fields: ['createdAt'] }]
  })
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

  @AllowNull(false)
  @Column({type:DataType.DATE,defaultValue: DataType.NOW})
  startDate: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  expiryDate: Date;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;
}