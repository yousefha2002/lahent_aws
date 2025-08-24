import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, AllowNull } from 'sequelize-typescript';
import { ProductInstruction } from './product_instruction.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'product_instruction_languages' })
export class ProductInstructionLanguage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => ProductInstruction)
    @Column(DataType.INTEGER)
    productInstructionId: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @BelongsTo(() => ProductInstruction)
    productInstruction: ProductInstruction;
}