import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, AllowNull } from 'sequelize-typescript';

export type UserRole = 'customer' | 'owner' | 'store';

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
    @Column(DataType.ENUM('customer', 'owner', 'store'))
    role: UserRole;

    @AllowNull(false)
    @Column(DataType.STRING)
    token: string;

    @Column(DataType.STRING)
    deviceName: string;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    createdAt: Date;
}