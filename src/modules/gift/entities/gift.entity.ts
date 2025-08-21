import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
} from 'sequelize-typescript';
import { GiftStatus } from 'src/common/enums/gift_status';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { GiftTemplate } from 'src/modules/gift_template/entities/gift_template.entity';

@Table({ tableName: 'gifts' })
export class Gift extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Customer)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  senderId: number;

  @BelongsTo(() => Customer, 'senderId')
  sender: Customer;

  @ForeignKey(() => Customer)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  receiverId: number | null;

  @BelongsTo(() => Customer, 'receiverId')
  receiver: Customer;

  @Column(DataType.STRING)
  receiverPhone: string;

  @Column(DataType.STRING)
  receiverName: string;

  @ForeignKey(() => GiftTemplate)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  giftTemplateId: number;

  @BelongsTo(() => GiftTemplate)
  giftTemplate: GiftTemplate;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount: number;

  @Default(GiftStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(GiftStatus)))
  status: GiftStatus;
}
