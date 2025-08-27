import {
    Table,
    Column,
    Model,
    DataType,
    AutoIncrement,
    PrimaryKey,
    AllowNull,
    Default,
} from 'sequelize-typescript';
import { RoleStatus } from 'src/common/enums/role_status';

@Table({ tableName: 'otp_codes' })
export class OtpCode extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    phone: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    code: string;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isVerified: boolean;

    @AllowNull(false)
    @Column(DataType.ENUM(RoleStatus.OWNER, RoleStatus.CUSTOMER))
    type: RoleStatus.OWNER | RoleStatus.CUSTOMER;

    @AllowNull(false)
    @Column(DataType.DATE)
    expiresAt: Date;
}