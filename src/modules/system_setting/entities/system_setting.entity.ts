import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'setting_system' })
export class SystemSetting extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    phoneNumber: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    country: string;
}