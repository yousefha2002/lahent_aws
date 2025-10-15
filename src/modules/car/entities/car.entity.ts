import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { CarBrand } from 'src/modules/car_brand/entities/car_brand.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';

@Table({ 
  tableName: 'cars',
  indexes:[
    { name: 'idx_customer_isSave', fields: ['customerId', 'isSave'] },
    { name: 'idx_customer_carName_isSave', fields: ['customerId', 'carName', 'isSave'], unique: true }, 
    { name: 'idx_customer_isSave_createdAt', fields: ['customerId', 'isSave', 'createdAt'] },
  ]
})
export class Car extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Customer)
  @Column(DataType.INTEGER)
  customerId: number;

  @BelongsTo(() => Customer,{onDelete: 'CASCADE'})
  customer: Customer;

  @AllowNull(false)
  @Column(DataType.STRING)
  carName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  color: string;

  @ForeignKey(() => CarBrand)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  brandId: number;

  @BelongsTo(() => CarBrand)
  brand: CarBrand;

  @AllowNull(false)
  @Column({
  type: DataType.INTEGER,
    validate: {
      min: 1,
      max: 9,
    },
  })
  carType: number; 

  @AllowNull(true)
  @Column(DataType.STRING)
  plateNumber: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  plateLetters: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDefault: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isSave: boolean;
}
