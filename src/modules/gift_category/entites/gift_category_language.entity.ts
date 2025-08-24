import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
} from 'sequelize-typescript';

import { Language } from 'src/common/enums/language';
import { GiftCategory } from './gift_category.entity';

@Table({ tableName: 'gift_gategory_languages' })
export class GiftCategoryLanguage extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => GiftCategory)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  giftCategoryId: number;

  @BelongsTo(() => GiftCategory)
  giftCategory: GiftCategory;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Language)))
  languageCode: Language;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
