import {
  Table,
  Column,
  ForeignKey,
  Model,
  AutoIncrement,
  PrimaryKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ 
  tableName: 'favorites', 
  timestamps: true ,
  indexes: [
      {
        unique: true,
        name: 'idx_customer_store',
        fields: ['customerId', 'storeId'],
      },
      { fields: ['storeId'] }
    ]}
  )
export class Favorite extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Customer)
  @Column
  customerId: number;

  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @BelongsTo(() => Store,{onDelete: 'CASCADE'})
  store: Store;

  @BelongsTo(() => Customer,{onDelete: 'CASCADE'})
  customer: Customer;
}
