import { Table, Column, Model, DataType, ForeignKey, AllowNull, BelongsTo } from 'sequelize-typescript';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'store_commissions' })
export class StoreCommission extends Model {
    @AllowNull(false)
    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store,{onDelete: 'CASCADE'})
    store: Store;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    commissionPercent: number; // نسبة العمولة 5% مثلا
}