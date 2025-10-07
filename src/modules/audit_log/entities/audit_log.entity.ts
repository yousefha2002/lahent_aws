import {Table,Column,Model,DataType,PrimaryKey,AutoIncrement} from 'sequelize-typescript';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { RoleStatus } from 'src/common/enums/role_status';

@Table({ tableName: 'audit_logs' })
export class AuditLog extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.BIGINT)
    id: number;

    @Column({ type: DataType.BIGINT, allowNull: true })
    userId: number;

    @Column({ type: DataType.ENUM(...Object.values(RoleStatus)), allowNull: false })
    userRole: RoleStatus;

    @Column({ type: DataType.ENUM(...Object.values(AuditLogEntity)), allowNull: false })
    entity: AuditLogEntity;

    @Column({ type: DataType.BIGINT, allowNull: true })
    entityId: number;

    @Column({ type: DataType.ENUM(...Object.values(AuditLogAction)), allowNull: false })
    action: AuditLogAction;

    @Column({ type: DataType.JSONB, allowNull: true })
    oldData: any;

    @Column({ type: DataType.JSONB, allowNull: true })
    newData: any;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;
}