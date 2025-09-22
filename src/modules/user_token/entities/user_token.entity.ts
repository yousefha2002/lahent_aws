import {
    Table,
    Column,
    Model,
    DataType,
    AllowNull,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    Default,
} from 'sequelize-typescript';
import { RoleStatus } from 'src/common/enums/role_status';

@Table({ tableName: 'user_tokens' })
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

    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt: Date;

    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt: Date;
}
