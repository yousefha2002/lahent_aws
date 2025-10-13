import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { RolePermission } from 'src/modules/role/entites/role_permission.entity';

@Table({ tableName: 'roles' })
export class Role extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    name: string;

    @HasMany(() => RolePermission)
    rolePermissions: RolePermission[];
}