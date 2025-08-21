import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Unique,
    HasMany,
} from 'sequelize-typescript';
import { GiftTemplate } from 'src/modules/gift_template/entities/gift_template.entity';

@Table({ tableName: 'gift_categories' })
export class GiftCategory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    name: string;

    @HasMany(() => GiftTemplate)
    templates: GiftTemplate[];
}