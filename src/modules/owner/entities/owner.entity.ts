import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  Default,
} from 'sequelize-typescript';
import { cities } from 'src/common/constants/cities';
import { City } from 'src/common/types/city';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ 
  tableName: 'owners',
  paranoid: true,
  indexes:[
    { name: 'idx_owner_email', fields: ['email'] },
    { name: 'idx_owner_city', fields: ['city'] },
    { name: 'idx_owner_name', fields: ['name'] },
    { name: 'idx_owner_createdAt', fields: ['createdAt'] },
    { name: 'idx_owner_deletedAt', fields: ['deletedAt'] },
    { name: 'idx_owner_phone_createdAt', fields: ['phone', 'createdAt'] }
  ]
})
export class Owner extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column({type:DataType.STRING,unique:true})
  phone: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  email: string;

  @HasMany(() => Store)
  stores: Store[];

  @Column(DataType.ENUM(...cities))
  city: City;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCompletedProfile: boolean;
}
