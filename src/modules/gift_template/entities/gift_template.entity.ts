import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { GiftCategory } from 'src/modules/gift_category/entites/gift_category.entity';

@Table({ tableName: 'gift_templates' })
export class GiftTemplate extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    imageUrl: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    imagePublicId: string;

    @ForeignKey(() => GiftCategory)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    categoryId: number;

    @BelongsTo(() => GiftCategory)
    category: GiftCategory;

    @AllowNull(true)
    @Column(DataType.DATE)
    startDate: Date | null;

    @AllowNull(true)
    @Column(DataType.DATE)
    endDate: Date | null;
}
