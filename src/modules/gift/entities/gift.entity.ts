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

@Table({ 
  tableName: 'gifts',
    indexes: [
      {
        name: 'idx_receiverPhone_status',
        fields: ['receiverPhone', 'status'],
      },
      { fields: ['senderId'] },
      { fields: ['receiverId'] },
    ]
 })
export class Gift extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Customer)
  @Column(DataType.INTEGER)
  senderId: number;

  @BelongsTo(() => Customer, { foreignKey: 'senderId', onDelete: 'SET NULL' })
  sender: Customer;

  @ForeignKey(() => Customer)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  receiverId: number | null;

  @BelongsTo(() => Customer, { foreignKey: 'receiverId', onDelete: 'SET NULL' })
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
