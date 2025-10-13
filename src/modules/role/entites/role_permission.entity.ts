import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { PermissionKey } from 'src/common/enums/permission-key';
import { Role } from 'src/modules/role/entites/role.entity';

@Table({ tableName: 'roles_permissions' })
export class RolePermission extends Model {
    @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    })
    id: number;
    
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER)
    roleId: number;

    @Column({
        type: DataType.ENUM(...Object.values(PermissionKey)),
        allowNull: false,
    })
    permission: PermissionKey;
}