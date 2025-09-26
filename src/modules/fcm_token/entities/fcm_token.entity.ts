import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, AllowNull } from 'sequelize-typescript';
import { RoleStatus } from 'src/common/enums/role_status';


@Table({ tableName: 'fcm_tokens' })
export class FcmToken extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    userId: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(RoleStatus)))
    role:RoleStatus;

    @AllowNull(false)
    @Column(DataType.STRING)
    token: string;

    @Column(DataType.STRING)
    deviceName: string;
}