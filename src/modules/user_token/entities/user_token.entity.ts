import {Table,Column,Model,DataType,AllowNull,PrimaryKey,AutoIncrement,Default, CreatedAt, UpdatedAt} from 'sequelize-typescript';
import { RoleStatus } from 'src/common/enums/role_status';

@Table({ 
    tableName: 'user_tokens' ,
    indexes: [
        { name: 'idx_user_tokens_refreshToken', fields: ['refreshToken'] },
        { name: 'idx_user_tokens_refreshToken_device', fields: ['refreshToken', 'deviceId', 'isRevoked', 'expiresAt'] },
        { name: 'idx_user_tokens_role_customer', fields: ['role', 'customerId'] },
        { name: 'idx_user_tokens_role_store', fields: ['role', 'storeId'] },
        { name: 'idx_user_tokens_role_owner', fields: ['role', 'ownerId'] },
        { name: 'idx_user_tokens_role_admin', fields: ['role', 'adminId'] },
        { name: 'idx_user_tokens_deviceId', fields: ['deviceId'] },
    ],
})
export class UserToken extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    refreshToken: string;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(RoleStatus)))
    role:RoleStatus;

    @Column(DataType.INTEGER)
    customerId?: number;

    @Column(DataType.INTEGER)
    adminId?: number; 

    @Column(DataType.INTEGER)
    ownerId?: number;

    @Column(DataType.INTEGER)
    storeId?: number;

    @Column(DataType.STRING)
    device?: string; // User agent أو Device info

    @Column(DataType.STRING)
    ip?: string; // IP الجهاز

    @Default(false)
    @Column(DataType.BOOLEAN)
    isRevoked: boolean;

    @AllowNull(false)
    @Column(DataType.DATE)
    expiresAt: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    lastLoginAt?: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    lastLogoutAt?: Date;

    @AllowNull(false)
    @Column(DataType.STRING)
    deviceId: string;
}