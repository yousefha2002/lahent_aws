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
import { GiftCategoryLanguage } from './gift_category_language.entity';

@Table({ tableName: 'gift_categories' })
export class GiftCategory extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @HasMany(() => GiftTemplate)
  templates: GiftTemplate[];

  @HasMany(() => GiftCategoryLanguage)
  languages: GiftCategoryLanguage[];
}
