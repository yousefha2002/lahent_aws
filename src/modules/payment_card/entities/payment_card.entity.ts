import {Table,Column,Model,DataType,PrimaryKey,AutoIncrement,Default,AllowNull} from 'sequelize-typescript';

@Table({ tableName: 'payment_cards' })
export class PaymentCard extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(14), unique: true })
    cardNumber: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(4) })
    ccv: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    expiryDate: Date;

    @AllowNull(false)
    @Column(DataType.STRING)
    cardHolderName: string;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isDefault: boolean;
}