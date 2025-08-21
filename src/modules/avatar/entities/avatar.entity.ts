import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'avatars', timestamps: false })
export class Avatar extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    url: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    publicId: string;
}
