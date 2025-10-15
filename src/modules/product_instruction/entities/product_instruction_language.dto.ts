import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey, AllowNull } from 'sequelize-typescript';
import { ProductInstruction } from './product_instruction.entity';
import { Language } from 'src/common/enums/language';

@Table({ 
    tableName: 'product_instruction_languages',
    indexes:[
        { 
            name: 'idx_instruction_language_productInstructionId_languageCode',
            fields: ['productInstructionId', 'languageCode'] 
        },
        { 
            name: 'idx_instruction_language_productInstructionId',
            fields: ['productInstructionId']
        },
    ]
})
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

    @BelongsTo(() => ProductInstruction,{onDelete: 'CASCADE'})
    productInstruction: ProductInstruction;
}