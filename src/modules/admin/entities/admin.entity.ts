import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'admins' })
export class Admin extends Model {
    @Column({ allowNull: false, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;
}