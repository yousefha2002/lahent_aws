import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
} from 'sequelize-typescript';

@Table({ tableName: 'loyalty_offers' })
export class LoyaltyOffer extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    amountRequired: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    bonusAmount: number;

    @AllowNull(true)
    @Column(DataType.DATE)
    startDate: Date;

    @AllowNull(true)
    @Column(DataType.DATE)
    endDate: Date;

    @Default(true)
    @Column(DataType.BOOLEAN)
    isActive: boolean;
}