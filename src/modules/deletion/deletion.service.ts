import { UserTokenService } from '../user_token/user_token.service';
import { CustomerService } from '../customer/customer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Customer } from 'src/modules/customer/entities/customer.entity';

@Injectable()
export class DeletionService {
    constructor(
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly customerService:CustomerService,
        private readonly userTokenService:UserTokenService,
    ){}

    async softDeleteCustomer(customer:Customer)
    {
        const transaction = await this.sequelize.transaction();
        try{
            await customer.destroy({ transaction });
            await this.userTokenService.deleteByCustomer(customer.id,transaction)
            await transaction.commit()
        }
        catch(error){
            await transaction.rollback();
            throw error;
        }
    }

    async hardDeleteCustomer(customerId: number) {
        const transaction = await this.sequelize.transaction();
        try {
            const customer = await this.customerService.findDeletedCustomer(customerId,transaction);
            if (!customer) throw new NotFoundException('Customer not found');
            await this.userTokenService.deleteByCustomer(customer.id, transaction);
            await customer.destroy({ force: true, transaction });
            await transaction.commit();
            return { status: 'success', message: 'Customer deleted permanently' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async restoreCustomer(customerId: number) {
        const transaction = await this.sequelize.transaction();
        try {
            const customer = await this.customerService.findDeletedCustomer(customerId,transaction);
            await customer.restore({ transaction });
            await transaction.commit();
            return {status:"success"};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
