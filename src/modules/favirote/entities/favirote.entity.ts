import {
  Table,
  Column,
  ForeignKey,
  Model,
  AutoIncrement,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'favorites', timestamps: true })
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
}
