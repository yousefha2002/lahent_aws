import { Table, Column, Model, DataType, ForeignKey, AllowNull, BelongsTo } from 'sequelize-typescript';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'store_commissions',paranoid: true })
export class StoreCommission extends Model {
    @AllowNull(false)
    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store,{onDelete: 'CASCADE'})
    store: Store;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    commissionPercent: number;
}