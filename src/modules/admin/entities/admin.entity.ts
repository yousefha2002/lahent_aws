import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Role } from 'src/modules/role/entites/role.entity';

@Table({ tableName: 'admins' })
export class Admin extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    phone: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isSuperAdmin: boolean;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    roleId: number;

    @BelongsTo(() => Role)
    role: Role;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    active: boolean;
}