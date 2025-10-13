import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'loyalty_settings' })
export class LoyaltySetting extends Model {
    @Column({
        type: DataType.FLOAT,
        defaultValue: 0.02, // كل ريال يعطي 0.02 نقطة
        comment: 'عدد النقاط المكتسبة لكل ريال'
    })
    pointsPerCurrency: number;

    @Column({
        type: DataType.FLOAT,
        defaultValue: 0.05, // كل نقطة تساوي 0.05 ريال عند الدفع بالنقاط
        comment: 'قيمة النقطة عند الاستعمال للخصم'
    })
    currencyPerPoint: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 5, // عدد النقاط المكتسبة عند قبول الدعوة
        comment: 'عدد النقاط المكتسبة عند قبول الدعوة'
    })
    pointsPerInviteAcceptance: number;
}